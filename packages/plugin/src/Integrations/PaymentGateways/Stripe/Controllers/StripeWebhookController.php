<?php

namespace Solspace\Freeform\Integrations\PaymentGateways\Stripe\Controllers;

use Solspace\Freeform\controllers\BaseApiController;
use Solspace\Freeform\Library\Helpers\IsolatedTwig;
use Solspace\Freeform\Services\SubmissionsService;
use yii\web\Response;

class StripeWebhookController extends BaseApiController
{
    protected array|bool|int $allowAnonymous = ['webhooks'];

    public function __construct(
        $id,
        $module,
        $config = [],
        private IsolatedTwig $isolatedTwig,
        private SubmissionsService $submissionsService,
    ) {
        parent::__construct($id, $module, $config);
    }

    public function actionWebhooks(): Response
    {
    }
}
