<?php

namespace Solspace\Freeform\Integrations\PaymentGateways\Stripe\Controllers;

use craft\helpers\UrlHelper;
use Solspace\Freeform\Integrations\PaymentGateways\Stripe\Services\StripeCustomerService;
use Solspace\Freeform\Library\Helpers\IsolatedTwig;
use Solspace\Freeform\Records\Pro\Payments\PaymentRecord;
use Solspace\Freeform\Records\SavedFormRecord;
use Solspace\Freeform\Services\SubmissionsService;
use Stripe\PaymentIntent;
use yii\web\NotFoundHttpException;
use yii\web\Response;

class StripeCustomerController extends BaseStripeController
{
    protected array|bool|int $allowAnonymous = ['callback'];

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

        $this->customerService->getOrCreateCustomer(
            $integration,
            $paymentIntent->customer,
            $mappedValues,
        );

        return $this->asEmptyResponse(204);
    }
}
