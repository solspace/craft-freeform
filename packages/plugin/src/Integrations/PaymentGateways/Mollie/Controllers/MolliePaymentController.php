<?php

namespace Solspace\Freeform\Integrations\PaymentGateways\Mollie\Controllers;

use craft\helpers\UrlHelper;
use Solspace\Freeform\Bundles\Integrations\Providers\IntegrationClientProvider;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Form\Settings\Implementations\BehaviorSettings;
use Solspace\Freeform\Integrations\PaymentGateways\Mollie\Fields\MollieField;
use Solspace\Freeform\Integrations\PaymentGateways\Mollie\Mollie;
use Solspace\Freeform\Integrations\PaymentGateways\Mollie\Services\MolliePaymentService;
use Solspace\Freeform\Integrations\PaymentGateways\Mollie\Services\MolliePriceService;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;
use Solspace\Freeform\Library\Helpers\HashHelper;
use Solspace\Freeform\Library\Helpers\IsolatedTwig;
use yii\web\NotFoundHttpException;
use yii\web\Response;

class MolliePaymentController extends BaseMollieController
{
    public const PAYMENT_STATUS_PARAM = 'freeformPaymentStatus';

    public $enableCsrfValidation = false;
    protected array|bool|int $allowAnonymous = ['index', 'callback'];

    public function __construct(
        $id,
        $module,
        $config,
        private IntegrationClientProvider $clientProvider,
        private IsolatedTwig $isolatedTwig,
    ) {
        parent::__construct($id, $module, $config);
    }

    public function actionIndex($id = null): Response
    {
        try {
            [$form, $integration, $field] = $this->getRequestItems();
        } catch (NotFoundHttpException $exception) {
            return $this->asSerializedJson(['errors' => [$exception->getMessage()]], 404);
        }

        $body = json_decode($this->request->getRawBody() ?: '[]', true) ?: [];
        $values = $body['values'] ?? null;
        if (\is_array($values)) {
            foreach ($form->getLayout()->getFields() as $formField) {
                $handle = $formField->getHandle();
                if (\array_key_exists($handle, $values)) {
                    $formField->setValue($values[$handle]);
                }
            }
        }

        $priceService = new MolliePriceService();

        try {
            $amount = $priceService->getAmount($form, $field) / 100; // Convert from cents to major units
        } catch (\Throwable $e) {
            return $this->asSerializedJson(['errors' => ['Invalid amount: '.$e->getMessage()]], 400);
        }

        $currency = strtoupper((string) ($body['currency'] ?? $field->getCurrency() ?? 'EUR'));
        $description = $this->resolveDescription($field, $form);
        $redirectUrl = $this->buildCallbackUrl($form, $integration, $field);
        $webhookUrl = (string) ($body['webhookUrl'] ?? $integration->getWebhookUrl() ?? '');

        if ($amount <= 0) {
            return $this->asSerializedJson(['errors' => ['Missing amount']], 400);
        }

        try {
            $client = $this->clientProvider->getAuthorizedClient($integration); // ensure authorization performed
            $paymentService = new MolliePaymentService($integration);

            $paymentData = [
                'amount' => [
                    'currency' => $currency,
                    'value' => number_format($amount, 2, '.', ''),
                ],
                'description' => $description,
                'redirectUrl' => $redirectUrl,
                'webhookUrl' => $webhookUrl,
                'metadata' => [
                    'formId' => $form->getId(),
                    'fieldHandle' => $field->getHandle(),
                ],
            ];

            $payment = $paymentService->createPayment($paymentData);

            return $this->asSerializedJson([
                'success' => true,
                'payment' => $payment,
                'checkoutUrl' => $payment['_links']['checkout']['href'] ?? null,
                'paymentId' => $payment['id'] ?? null,
            ]);
        } catch (IntegrationException $e) {
            return $this->asSerializedJson(['errors' => ['Payment creation failed: '.$e->getMessage()]], 500);
        } catch (\Exception $e) {
            return $this->asSerializedJson(['errors' => ['Internal server error: '.$e->getMessage()]], 500);
        }
    }

    /**
     * Mollie redirects the payer here after checkout. Because Mollie returns to the same
     * URL for paid/canceled/failed alike, this handler verifies the real status and then
     * re-enters Freeform's success pipeline (flash + success-behavior redirect) so the
     * banner / success template / redirect works for both AJAX and non-AJAX forms.
     */
    public function actionCallback(): Response
    {
        [$form, $integration, $field] = $this->getRequestItems();

        $sessionKey = Mollie::SESSION_RETURN_KEY.$form->getId();
        $context = \Craft::$app->getSession()->get($sessionKey);

        \Craft::$app->getSession()->remove($sessionKey);

        $paymentId = \is_array($context) ? ($context['paymentId'] ?? null) : null;
        $sourceUrl = \is_array($context) ? ($context['sourceUrl'] ?? null) : null;

        $fallbackUrl = $sourceUrl ?: UrlHelper::siteUrl();

        $status = $this->fetchPaymentStatus($integration, $paymentId);

        // Mollie considers "paid" (and "authorized" for some methods) a completed payment.
        if (!\in_array($status, ['paid', 'authorized'], true)) {
            return $this->redirect($this->appendStatus($fallbackUrl, $status ?: 'failed'));
        }

        // Tell Freeform this form was submitted successfully so the banner / success
        // template renders on the page we return to (mirrors a normal non-AJAX submit).
        \Craft::$app->getSession()->setFlash(Form::SUBMISSION_FLASH_KEY, $form->getId());

        return $this->redirect($this->resolveSuccessDestination($field, $form, $fallbackUrl));
    }

    /**
     * The description supports the `form` object in Twig (e.g. 'Payment from "{{ form.name }}"').
     * It is rendered from the field's own (trusted) setting rather than the client-supplied
     * body to avoid rendering arbitrary posted Twig. Falls back to the raw string on error.
     */
    private function resolveDescription(MollieField $field, Form $form): string
    {
        $description = $field->getDescription();

        try {
            return $this->isolatedTwig->render($description, [
                'form' => $form,
                'field' => $field,
            ]);
        } catch (\Throwable) {
            return $description;
        }
    }

    /**
     * Resolve where a successful payment lands, honoring (in order): the field's own
     * "Successful Redirect URL" override, then the form's configured success behavior.
     */
    private function resolveSuccessDestination(MollieField $field, Form $form, string $fallbackUrl): string
    {
        $fieldRedirect = trim((string) $field->getRedirectUrl());
        if ('' !== $fieldRedirect) {
            return $this->renderTwig($fieldRedirect, $form) ?: $this->appendStatus($fallbackUrl, 'paid');
        }

        $behavior = $form->getSettings()->getBehavior();

        return match ($behavior->successBehavior) {
            BehaviorSettings::SUCCESS_BEHAVIOR_REDIRECT_RETURN_URL => $this->renderTwig($behavior->returnUrl, $form) ?: $this->appendStatus($fallbackUrl, 'paid'),
            BehaviorSettings::SUCCESS_BEHAVIOR_REDIRECT_ENTRY => $this->resolveEntryUrl($behavior) ?: $this->appendStatus($fallbackUrl, 'paid'),
            default => $this->appendStatus($fallbackUrl, 'paid'),
        };
    }

    private function resolveEntryUrl(BehaviorSettings $behavior): ?string
    {
        $entryIds = $behavior->entryId ?? [];
        $entryId = \is_array($entryIds) ? reset($entryIds) : $entryIds;
        if (!$entryId) {
            return null;
        }

        return \Craft::$app->getEntries()->getEntryById((int) $entryId)?->getUrl();
    }

    private function buildCallbackUrl(Form $form, Mollie $integration, MollieField $field): string
    {
        $hash = HashHelper::hash([$form->getId(), $integration->getId(), $field->getId()]);

        return UrlHelper::siteUrl('freeform/payments/mollie/callback', ['integration' => $hash]);
    }

    private function fetchPaymentStatus(Mollie $integration, ?string $paymentId): ?string
    {
        if (!$paymentId) {
            return null;
        }

        try {
            $this->clientProvider->getAuthorizedClient($integration);
            $payment = (new MolliePaymentService($integration))->getPayment($paymentId);

            return $payment['status'] ?? null;
        } catch (\Throwable) {
            return null;
        }
    }

    private function renderTwig(string $template, Form $form): string
    {
        if ('' === trim($template)) {
            return '';
        }

        try {
            return $this->isolatedTwig->render($template, [
                'form' => $form,
                'submission' => $form->getSubmission(),
            ]);
        } catch (\Throwable) {
            return $template;
        }
    }

    private function appendStatus(string $url, string $status): string
    {
        if (!UrlHelper::isAbsoluteUrl($url)) {
            $url = UrlHelper::siteUrl($url);
        }

        return UrlHelper::urlWithParams($url, [self::PAYMENT_STATUS_PARAM => $status]);
    }
}
