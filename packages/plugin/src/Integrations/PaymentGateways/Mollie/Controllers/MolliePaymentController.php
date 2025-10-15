<?php

namespace Solspace\Freeform\Integrations\PaymentGateways\Mollie\Controllers;

use Solspace\Freeform\Bundles\Integrations\Providers\IntegrationClientProvider;
use Solspace\Freeform\Integrations\PaymentGateways\Mollie\Services\MolliePaymentService;
use Solspace\Freeform\Integrations\PaymentGateways\Mollie\Services\MolliePriceService;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;
use yii\web\NotFoundHttpException;
use yii\web\Response;

class MolliePaymentController extends BaseMollieController
{
    public $enableCsrfValidation = false;
    protected array|bool|int $allowAnonymous = ['index'];

    public function __construct(
        $id,
        $module,
        $config,
        private IntegrationClientProvider $clientProvider,
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
        $description = (string) ($body['description'] ?? $field->getDescription() ?? '');
        $redirectUrl = (string) ($body['redirectUrl'] ?? $field->getRedirectUrl() ?? '');
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
}
