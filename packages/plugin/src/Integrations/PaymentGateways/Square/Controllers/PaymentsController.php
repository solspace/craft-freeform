<?php

namespace Solspace\Freeform\Integrations\PaymentGateways\Square\Controllers;

use GuzzleHttp\Exception\RequestException;
use GuzzleHttp\RequestOptions;
use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Bundles\Integrations\Providers\IntegrationClientProvider;
use Solspace\Freeform\controllers\BaseApiController;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Integrations\PaymentGateways\Square\Fields\SquareField;
use Solspace\Freeform\Integrations\PaymentGateways\Square\Services\SquarePriceService;
use Solspace\Freeform\Integrations\PaymentGateways\Square\Square;
use Solspace\Freeform\Library\Helpers\HashHelper;
use yii\web\NotFoundHttpException;
use yii\web\Response;

class PaymentsController extends BaseApiController
{
    protected array|bool|int $allowAnonymous = ['create'];

    public function __construct(
        $id,
        $module,
        $config,
        private IntegrationClientProvider $clientProvider,
    ) {
        parent::__construct($id, $module, $config);
    }

    public function init(): void
    {
        parent::init();

        // Disable CSRF validation for API endpoints
        $this->enableCsrfValidation = false;
    }

    public function actionCreate(): Response
    {
        try {
            [$form, $integration, $field] = $this->getRequestItems();
        } catch (NotFoundHttpException $exception) {
            return $this->asSerializedJson(['errors' => [$exception->getMessage()]], 404);
        }

        $client = $this->clientProvider->getAuthorizedClient($integration);

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

        $priceService = new SquarePriceService();

        try {
            $amount = $priceService->getAmount($form, $field);
        } catch (\Throwable $e) {
            return $this->asSerializedJson(['errors' => ['Invalid amount: '.$e->getMessage()]], 400);
        }

        $currency = strtoupper((string) ($body['currency'] ?? $field->getCurrency() ?? 'USD'));
        $nonce = (string) ($body['nonce'] ?? '');

        if (!$amount || !$nonce) {
            return $this->asSerializedJson(['errors' => ['Missing amount or nonce']], 400);
        }

        $payload = [
            'idempotency_key' => bin2hex(random_bytes(16)),
            'amount_money' => [
                'amount' => $amount,
                'currency' => $currency,
            ],
            'source_id' => $nonce,
            'location_id' => $integration->getLocationId(),
        ];

        try {
            $response = $client->post('/v2/payments', [
                RequestOptions::JSON => $payload,
            ]);

            $data = json_decode($response->getBody()->getContents(), true);

            // Determine success based on Square payment status
            $payment = $data['payment'] ?? [];
            $status = (string) ($payment['status'] ?? '');

            $isSuccessful = \in_array($status, ['COMPLETED', 'APPROVED'], true);

            // Respond with success state; existing form behavior controls redirects client-side
            $payload = [
                'success' => $isSuccessful,
                'payment' => $payment,
                'submissionId' => $form->getSubmission()->id ?? null,
            ];

            return $this->asSerializedJson($payload, $response->getStatusCode());
        } catch (\Throwable $e) {
            $statusCode = 500;
            $errors = ['Square payment failed'];

            if ($e instanceof RequestException && $e->hasResponse()) {
                $statusCode = $e->getResponse()->getStatusCode() ?: 500;

                try {
                    $body = (string) $e->getResponse()->getBody();
                    $json = json_decode($body, true);
                    if (isset($json['errors']) && \is_array($json['errors'])) {
                        $errors = [];
                        foreach ($json['errors'] as $err) {
                            $detail = $err['detail'] ?? ($err['message'] ?? 'Payment error');
                            $code = $err['code'] ?? null;
                            $errors[] = $code ? \sprintf('%s (%s)', $detail, $code) : $detail;
                        }
                    }
                } catch (\Throwable) {
                    // ignore JSON parse errors
                }
            }

            return $this->asSerializedJson([
                'success' => false,
                'errors' => $errors,
            ], $statusCode);
        }
    }

    protected function getRequestItems(?string $hash = null): array
    {
        if (!$hash) {
            $hash = $this->request->getHeaders()->get('FF-SQUARE-INTEGRATION');
            if (!$hash) {
                $hash = $this->request->get('integration');
            }
        }

        if (!$hash) {
            throw new NotFoundHttpException('Integration not found');
        }

        $ids = HashHelper::decodeMultiple($hash);

        $formId = $ids[0] ?? 0;
        $integrationId = $ids[1] ?? 0;
        $fieldId = $ids[2] ?? 0;

        $form = $this->getFormsService()->getFormById($formId);
        if (!$form) {
            throw new NotFoundHttpException('Form not found');
        }

        $form->disableFunctionality(['captchas']);
        $form->handleRequest($this->request, true);

        /** @var Square $integration */
        $integration = $this->getIntegrationsService()->getFirstForForm(
            $form,
            Type::TYPE_PAYMENT_GATEWAYS,
            true,
            filter: fn ($i) => $i->getId() === $integrationId,
        );

        if (!$integration) {
            throw new NotFoundHttpException('Integration not found');
        }

        $field = $form->getLayout()->getFields()->get($fieldId);
        if (!$field instanceof SquareField) {
            throw new NotFoundHttpException('Field not found');
        }

        return [$form, $integration, $field];
    }
}
