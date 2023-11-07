<?php

namespace Solspace\Freeform\Integrations\PaymentGateways\Stripe\EventListeners;

use craft\events\RegisterUrlRulesEvent;
use craft\web\UrlManager;
use Solspace\Freeform\Integrations\PaymentGateways\Stripe\Controllers\PaymentIntentsController;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;
use yii\web\UrlRule;

class RegisterController extends FeatureBundle
{
    public function __construct()
    {
        $this->plugin()->controllerMap['stripe-payment-intents'] = PaymentIntentsController::class;

        Event::on(
            UrlManager::class,
            UrlManager::EVENT_REGISTER_SITE_URL_RULES,
            function (RegisterUrlRulesEvent $event) {
                $event->rules[] = new UrlRule([
                    'pattern' => 'freeform/payments/stripe/payment-intents',
                    'route' => 'freeform/stripe-payment-intents/create-payment-intent',
                    'verb' => ['POST', 'GET'],
                ]);
            }
        );
    }
}
