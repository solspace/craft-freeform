<?php

namespace Solspace\Freeform\Integrations\PaymentGateways\Stripe\Controllers;

use yii\web\Response;

class StripeWebhookController extends BaseStripeController
{
    protected array|bool|int $allowAnonymous = ['webhooks'];

    public function actionWebhooks(): Response
    {
        return $this->asSerializedJson(['success' => true]);
    }
}
