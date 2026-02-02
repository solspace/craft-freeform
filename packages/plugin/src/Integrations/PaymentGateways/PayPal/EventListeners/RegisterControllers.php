<?php

namespace Solspace\Freeform\Integrations\PaymentGateways\PayPal\EventListeners;

use craft\events\RegisterUrlRulesEvent;
use craft\web\UrlManager;
use Solspace\Freeform\Integrations\PaymentGateways\PayPal\Controllers\OrdersController;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;
use yii\web\UrlRule;

class RegisterControllers extends FeatureBundle
{
    public function __construct()
    {
        $this->registerController('paypal-orders', OrdersController::class);

        Event::on(
            UrlManager::class,
            UrlManager::EVENT_REGISTER_SITE_URL_RULES,
            static function (RegisterUrlRulesEvent $event) {
                // Create PayPal order for popup integration
                $event->rules[] = new UrlRule([
                    'pattern' => 'freeform/payments/paypal/orders',
                    'route' => 'freeform/paypal-orders/create',
                    'verb' => ['POST'],
                ]);

                // Capture PayPal payment after popup approval
                $event->rules[] = new UrlRule([
                    'pattern' => 'freeform/payments/paypal/orders/<orderId:[A-Za-z0-9-_%]+>/capture',
                    'route' => 'freeform/paypal-orders/capture',
                    'verb' => ['POST'],
                ]);
            }
        );
    }
}
