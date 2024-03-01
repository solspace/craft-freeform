<?php

namespace Solspace\Freeform\Integrations\PaymentGateways\Stripe\Controllers;

use Solspace\Freeform\Integrations\PaymentGateways\Stripe\Services\StripeCustomerService;
use Stripe\Exception\InvalidRequestException;
use yii\web\NotFoundHttpException;
use yii\web\Response;

class StripeCustomerController extends BaseStripeController
{
    protected array|bool|int $allowAnonymous = true;

    public function __construct(
        $id,
        $module,
        $config = [],
        private StripeCustomerService $customerService,
    ) {
        parent::__construct($id, $module, $config);
    }

    public function actionCustomer(string $paymentIntentId): Response
    {
        try {
            [$form, $integration, $field] = $this->getRequestItems();
        } catch (NotFoundHttpException $exception) {
            return $this->asSerializedJson(['errors' => [$exception->getMessage()]], 404);
        }

        $stripe = $integration->getStripeClient();
        $mappedValues = $integration->getMappedFieldValues($form);

        $paymentIntent = $stripe->paymentIntents->retrieve($paymentIntentId);

        try {
            $this->customerService->getOrCreateCustomer(
                $integration,
                $paymentIntent->customer,
                $mappedValues,
            );
        } catch (InvalidRequestException $exception) {
            $message = $exception->getMessage();
            if (str_starts_with($message, 'Invalid email')) {
                return $this->asEmptyResponse(200);
            }

            throw $exception;
        }

        return $this->asEmptyResponse(204);
    }
}
