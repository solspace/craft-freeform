<?php

namespace Solspace\Freeform\Integrations\PaymentGateways\PayPal\Controllers;

use Solspace\Freeform\Integrations\PaymentGateways\PayPal\Services\PayPalOrderService;
use Solspace\Freeform\Integrations\PaymentGateways\PayPal\Services\PayPalPriceService;
use Solspace\Freeform\Library\Helpers\IsolatedTwig;
use yii\web\NotFoundHttpException;
use yii\web\Response;

class OrdersController extends BasePayPalController
{
    public $enableCsrfValidation = false;
    protected array|bool|int $allowAnonymous = true;

    public function __construct(
        $id,
        $module,
        $config,
        private IsolatedTwig $isolatedTwig,
        private PayPalOrderService $orderService,
        private PayPalPriceService $priceService,
    ) {
        parent::__construct($id, $module, $config);
    }

    public function actionCreate(): Response
    {
        try {
            [$form, $integration, $field, $hash] = $this->getRequestItems();

            if (!$integration->getClientId() || !$integration->getClientSecret()) {
                throw new \Exception('PayPal integration credentials are not configured');
            }
        } catch (NotFoundHttpException $exception) {
            return $this->asSerializedJson(['errors' => [$exception->getMessage()]], 404);
        } catch (\Exception $exception) {
            return $this->asSerializedJson(['errors' => [$exception->getMessage()]], 400);
        }

        $description = $this->isolatedTwig
            ->render(
                $field->getDescription(),
                [
                    'form' => $field->getForm(),
                    'field' => $field,
                ]
            )
        ;

        // Allow dynamic amount: merge posted values (from client) into form before calculating
        $raw = $this->request->getRawBody();
        $json = json_decode($raw, true);
        $values = $json['values'] ?? null;
        if (\is_array($values)) {
            foreach ($form->getLayout()->getFields() as $formField) {
                $handle = $formField->getHandle();
                if (\array_key_exists($handle, $values)) {
                    $formField->setValue($values[$handle]);
                }
            }
        }

        $amount = $this->priceService->getAmount($form, $field);
        $currency = $field->getCurrency();

        try {
            $order = $this->orderService->createOrder($form, $integration, $field, $description, $hash, $amount, $currency);
        } catch (\Throwable $e) {
            return $this->asSerializedJson(['errors' => ['Order creation failed: '.$e->getMessage()]], 500);
        } catch (\Exception $e) {
            return $this->asSerializedJson(['errors' => ['Order creation failed: '.$e->getMessage()]], 500);
        }

        return $this->asSerializedJson([
            'id' => $order['id'] ?? null,
            'status' => $order['status'] ?? null,
            'approve' => $order['approve'] ?? null,
        ], 201);
    }

    public function actionCapture(string $orderId): Response
    {
        try {
            [$form, $integration, $field] = $this->getRequestItems();
        } catch (NotFoundHttpException $exception) {
            return $this->asSerializedJson(['errors' => [$exception->getMessage()]], 404);
        } catch (\Throwable $exception) {
            return $this->asSerializedJson(['errors' => [$exception->getMessage()]], 500);
        }

        // Read optional latest form values sent from frontend to merge before finalize
        $raw = $this->request->getRawBody();
        $json = json_decode($raw, true);
        $values = $json['values'] ?? null;

        try {
            $result = $this->orderService->captureOrder($form, $integration, $field, $orderId, $values);

            return $this->asSerializedJson($result);
        } catch (\Throwable $e) {
            return $this->asSerializedJson(['errors' => ['Order capture failed: '.$e->getMessage()]], 500);
        }
    }
}
