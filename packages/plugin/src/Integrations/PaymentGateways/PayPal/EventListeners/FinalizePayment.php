<?php

namespace Solspace\Freeform\Integrations\PaymentGateways\PayPal\EventListeners;

use Solspace\Freeform\Bundles\Integrations\Providers\FormIntegrationsProvider;
use Solspace\Freeform\Bundles\Rules\RuleValidator;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\Forms\SubmitEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Integrations\PaymentGateways\PayPal\Fields\PayPalField;
use Solspace\Freeform\Integrations\PaymentGateways\PayPal\PayPal;
use Solspace\Freeform\Integrations\PaymentGateways\PayPal\Services\PayPalPaymentService;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Records\Pro\Payments\PaymentRecord;
use yii\base\Event;
use yii\base\ModelEvent;

class FinalizePayment extends FeatureBundle
{
    private array $locks = [];
    private array $verifiedPayments = [];

    public function __construct(
        private FormIntegrationsProvider $integrationsProvider,
        private PayPalPaymentService $paymentService,
        private RuleValidator $ruleValidator,
    ) {
        Event::on(Form::class, Form::EVENT_SUBMIT, [$this, 'onSubmit']);
        Event::on(Submission::class, Submission::EVENT_AFTER_SAVE, [$this, 'onSubmissionSaved']);
        Event::on(Form::class, Form::EVENT_AFTER_SUBMIT_ATTEMPT, [$this, 'releaseLocks']);
    }

    public function onSubmit(SubmitEvent $event): void
    {
        $form = $event->getForm();
        if (!$event->isValid || $form->getActions()) {
            return;
        }

        $submission = $form->getSubmission();
        if (!$submission) {
            return;
        }

        // Check the entire layout again at final submission, including earlier pages.
        foreach ($form->getLayout()->getFields(PayPalField::class) as $field) {
            if ($this->ruleValidator->isFieldHidden($form, $field)) {
                continue;
            }

            $orderId = $field->getValue();
            if (('' === $orderId || null === $orderId) && !$field->isRequired()) {
                continue;
            }

            try {
                if (!\is_string($orderId) || '' === $orderId) {
                    throw new \InvalidArgumentException('A completed PayPal payment is required.');
                }
                if (!$form->getSettings()->getGeneral()->storeData || !$form->hasOptInPermission()) {
                    throw new \InvalidArgumentException('PayPal payments require stored submissions.');
                }

                $configured = $field->getIntegration();
                $integration = $configured ? $this->integrationsProvider->getFirstForForm(
                    $form,
                    PayPal::class,
                    filter: static fn ($integration) => $integration->getId() === $configured->getId(),
                ) : null;
                if (!$integration) {
                    throw new \InvalidArgumentException('PayPal integration is unavailable.');
                }

                $key = 'freeform-paypal-'.hash('sha256', $integration->getId().'|'.$orderId);
                $formId = spl_object_id($form);
                if (isset($this->locks[$formId][$key]) || !\Craft::$app->getMutex()->acquire($key, 10)) {
                    throw new \InvalidArgumentException('PayPal payment is already being processed.');
                }
                $this->locks[$formId][$key] = $key;

                // Use the primary database under the order lock so a concurrent request
                // cannot reuse the order before its payment record is committed.
                $db = \Craft::$app->getDb();
                $payment = $db->useMaster(static fn () => $db->noCache(static fn () => PaymentRecord::findOne([
                    'integrationId' => $integration->getId(),
                    'resourceId' => $orderId,
                ])));
                if ($payment && ((int) $payment->submissionId !== (int) $submission->id || (int) $payment->fieldId !== $field->getId())) {
                    throw new \InvalidArgumentException('PayPal payment has already been used.');
                }

                [$order, $capture] = $this->paymentService->verify($form, $integration, $field, $orderId);
                $this->verifiedPayments[spl_object_id($submission)][] = [$field, $integration, $orderId, $order, $capture, $payment];
            } catch (\Throwable $exception) {
                $message = $exception instanceof \InvalidArgumentException
                    ? $exception->getMessage()
                    : 'Unable to verify PayPal payment. Please try again.';
                $field->addError(Freeform::t($message));
                $form->addError(Freeform::t($message));
                $event->isValid = false;
                $this->releaseLocks($event);

                return;
            }
        }
    }

    public function onSubmissionSaved(ModelEvent $event): void
    {
        $submission = $event->sender;
        $id = spl_object_id($submission);
        foreach ($this->verifiedPayments[$id] ?? [] as [$field, $integration, $orderId, $order, $capture, $payment]) {
            $payment ??= new PaymentRecord();
            $payment->integrationId = $integration->getId();
            $payment->fieldId = $field->getId();
            $payment->submissionId = $submission->id;
            $payment->resourceId = $orderId;
            $payment->type = 'payment';
            $payment->amount = (float) $capture->amount->value;
            $payment->currency = $capture->amount->currency_code;
            $payment->status = $capture->status;
            $payment->metadata = json_encode($this->buildMetadata($order, $capture, $payment, $orderId));
            if (!$payment->save()) {
                // This event runs inside Craft's element-save transaction. A payment
                // persistence failure must roll back the submission as well.
                throw new \RuntimeException('Unable to store verified PayPal payment.');
            }
        }
        unset($this->verifiedPayments[$id]);
    }

    public function releaseLocks(SubmitEvent $event): void
    {
        $form = $event->getForm();
        $id = spl_object_id($form);
        $keys = $this->locks[$id] ?? [];
        unset($this->locks[$id]);
        if ($submission = $form->getSubmission()) {
            unset($this->verifiedPayments[spl_object_id($submission)]);
        }
        if (!$keys) {
            return;
        }

        $mutex = \Craft::$app->getMutex();
        $release = static function () use ($mutex, $keys): void {
            foreach ($keys as $key) {
                $mutex->release($key);
            }
        };
        $db = \Craft::$app->getDb();
        if ($db->getTransaction()?->getIsActive()) {
            $db->onAfterTransaction($release);
        } else {
            $release();
        }
    }

    private function buildMetadata(object $order, ?object $capture, PaymentRecord $payment, string $orderId): array
    {
        $payer = $order->payment_source->paypal ?? $order->payer ?? null;
        $payerEmail = $payer->email_address ?? null;
        $payerGiven = $payer->name->given_name ?? null;
        $payerSurname = $payer->name->surname ?? null;
        $payerId = $payer->payer_id ?? $payer->account_id ?? null;
        $captureId = $capture->id ?? null;

        $captureSelfLink = null;
        foreach (($capture->links ?? []) as $l) {
            if (($l->rel ?? '') === 'self') {
                $captureSelfLink = $l->href ?? null;

                break;
            }
        }

        $paypalFee = $capture->seller_receivable_breakdown->paypal_fee->value ?? null;
        $netAmount = $capture->seller_receivable_breakdown->net_amount->value ?? null;

        return [
            'gateway' => 'paypal',
            'status' => $payment->status,
            'currency' => $payment->currency,
            'amount' => $payment->amount,
            'orderId' => (string) ($order->id ?? $orderId),
            'captureId' => $captureId,
            'captureLink' => $captureSelfLink,
            'payerEmail' => $payerEmail,
            'payerGivenName' => $payerGiven,
            'payerSurname' => $payerSurname,
            'payerId' => $payerId,
            'paypalFee' => $paypalFee,
            'netAmount' => $netAmount,
            'unit' => 'dollars',
        ];
    }
}
