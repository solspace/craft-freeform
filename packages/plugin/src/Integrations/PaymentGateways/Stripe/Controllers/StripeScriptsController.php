<?php

namespace Solspace\Freeform\Integrations\PaymentGateways\Stripe\Controllers;

use Solspace\Freeform\controllers\BaseFilesProxyController;
use yii\web\Response;

/**
 * @deprecated No longer used in Freeform 5.2.3
 */
class StripeScriptsController extends BaseFilesProxyController
{
    protected array|bool|int $allowAnonymous = true;

    public function actionIndex(): Response
    {
        $path = \Craft::getAlias('@freeform-scripts/front-end/payments/stripe/elements.js');

        return $this->getFileResponse($path, 'stripe.js', 'text/javascript');
    }
}
