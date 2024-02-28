<?php

namespace Solspace\Freeform\Integrations\PaymentGateways\Stripe\Controllers;

use Solspace\Freeform\controllers\BaseFilesProxyController;
use yii\web\Response;

class StripeScriptsController extends BaseFilesProxyController
{
    public function actionIndex(): Response
    {
        $scriptPath = \Craft::getAlias('@freeform-scripts/front-end/payments/stripe/elements.js');

        return $this->getFileResponse(
            $scriptPath,
            'stripe.js',
            'text/javascript'
        );
    }
}
