<?php

namespace Solspace\Freeform\Integrations\PaymentGateways\Stripe\EventListeners;

use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\Submissions\RenderSubmissionFieldEvent;
use Solspace\Freeform\Events\Submissions\RenderTableValueEvent;
use Solspace\Freeform\Integrations\PaymentGateways\Stripe\Fields\StripeField;
use Solspace\Freeform\Integrations\PaymentGateways\Stripe\Services\StripePaymentMethodIconService;
use Solspace\Freeform\Integrations\PaymentGateways\Stripe\Services\StripePriceService;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Records\Pro\Payments\PaymentRecord;
use Solspace\Freeform\Services\SubmissionsService;
use yii\base\Event;

class RenderTemplates extends FeatureBundle
{
    public function __construct(
        private StripePriceService $priceService,
        private StripePaymentMethodIconService $iconService,
    ) {
        Event::on(
            SubmissionsService::class,
            SubmissionsService::EVENT_RENDER_FIELD,
            [$this, 'renderSubmissionFieldTemplate']
        );

        Event::on(
            Submission::class,
            Submission::EVENT_RENDER_TABLE_VALUE,
            [$this, 'renderTableValue']
        );

        \Craft::$app->view->hook(
            'freeform.submissions.edit.sidepanel',
            [$this, 'renderSubmissionSidePanel']
        );
    }

    public function renderSubmissionFieldTemplate(RenderSubmissionFieldEvent $event): void
    {
        $field = $event->getField();
        if (!$field instanceof StripeField) {
            return;
        }

        $template = file_get_contents(__DIR__.'/../Templates/submission-field.twig');
        $noPaymentTemplate = file_get_contents(__DIR__.'/../Templates/submission-field-no-payment.twig');

        $stripeSvg = file_get_contents(__DIR__.'/../Assets/stripe.svg');

        $payment = PaymentRecord::findOne([
            'submissionId' => $event->getSubmission()->id,
            'fieldId' => $field->getId(),
        ]);

        if (!$payment) {
            $event->setOutput(
                \Craft::$app->view->renderString(
                    $noPaymentTemplate,
                    [
                        'field' => $field,
                        'submission' => $event->getSubmission(),
                        'stripeSvg' => $stripeSvg,
                    ]
                )
            );

            return;
        }

        $paymentMethod = $payment?->getPaymentMethod();

        $event->setOutput(
            \Craft::$app->view->renderString(
                $template,
                [
                    'field' => $field,
                    'amount' => $this->priceService->getFormattedAmount($payment->amount, $payment->currency),
                    'currency' => $payment?->currency,
                    'stripeSvg' => $stripeSvg,
                    'paymentMethodIcon' => $this->iconService->getIconFromPaymentMethod($paymentMethod),
                    'paymentMethod' => $paymentMethod,
                    'submission' => $event->getSubmission(),
                    'payment' => $payment,
                ]
            )
        );
    }

    public function renderSubmissionSidePanel(array &$context): ?string
    {
        $submission = $context['submission'];

        $payment = PaymentRecord::findOne([
            'submissionId' => $submission->id,
        ]);

        if (!$payment || !$payment->getPaymentMethod()) {
            return null;
        }

        $context['payment'] = $payment;
        $context['stripeSvg'] = file_get_contents(__DIR__.'/../Assets/stripe.svg');
        $context['amount'] = $this->priceService->getFormattedAmount($payment->amount, $payment->currency);
        $context['currency'] = $payment->currency;
        $context['paymentMethodIcon'] = $this->iconService->getIconFromPaymentMethod($payment->getPaymentMethod());
        $context['paymentMethod'] = $payment->getPaymentMethod();

        $templateContents = file_get_contents(__DIR__.'/../Templates/submission-side-panel.twig');

        return \Craft::$app->view->renderString(
            $templateContents,
            $context,
        );
    }

    public function renderTableValue(RenderTableValueEvent $event): void
    {
        $field = $event->getField();
        if (!$field instanceof StripeField) {
            return;
        }

        $submission = $event->getSubmission();
        $payment = PaymentRecord::findOne([
            'submissionId' => $submission->id,
            'fieldId' => $field->getId(),
        ]);

        if (!$payment) {
            $event->setOutput('-');

            return;
        }

        $template = file_get_contents(__DIR__.'/../Templates/submission-table-value.twig');

        $paymentMethod = $payment?->getPaymentMethod();

        $event->setOutput(
            \Craft::$app->view->renderString(
                $template,
                [
                    'field' => $field,
                    'amount' => $this->priceService->getFormattedAmount($payment->amount, $payment->currency),
                    'currency' => $payment?->currency,
                    'paymentMethodIcon' => $this->iconService->getIconFromPaymentMethod($paymentMethod),
                    'paymentMethod' => $paymentMethod,
                    'submission' => $event->getSubmission(),
                    'payment' => $payment,
                ]
            )
        );
    }
}
