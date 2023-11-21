<?php

namespace Solspace\Freeform\Integrations\PaymentGateways\Stripe\Controllers;

use Solspace\Freeform\controllers\BaseApiController;
use Solspace\Freeform\Library\Helpers\IsolatedTwig;
use Solspace\Freeform\Services\SubmissionsService;
use yii\web\Response;

class StripeWebhookController extends BaseStripeController
{
    protected array|bool|int $allowAnonymous = ['webhooks'];

    public function actionWebhooks(): Response
    {
        return $this->asSerializedJson(['success' => true]);
    }
}
