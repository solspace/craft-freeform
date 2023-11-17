<?php

namespace Solspace\Freeform\Integrations\PaymentGateways\Stripe\EventListeners;

use craft\events\RegisterUrlRulesEvent;
use craft\web\UrlManager;
use Solspace\Freeform\Integrations\PaymentGateways\Stripe\Controllers\FieldMappingController;
use Solspace\Freeform\Integrations\PaymentGateways\Stripe\Controllers\PaymentIntentsController;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;
use yii\web\UrlRule;

class RegisterController extends FeatureBundle
{
    public function __construct()
    {
        $this->plugin()->controllerMap['stripe-payment-intents'] = PaymentIntentsController::class;
        $this->plugin()->controllerMap['stripe-field-mapping'] = FieldMappingController::class;

        Event::on(
            UrlManager::class,
            UrlManager::EVENT_REGISTER_SITE_URL_RULES,
            function (RegisterUrlRulesEvent $event) {
                $event->rules[] = new UrlRule([
                    'pattern' => 'freeform/payments/stripe/payment-intents/<paymentIntentId:[a-zA-Z0-9_]+>',
                    'route' => 'freeform/stripe-payment-intents/payment-intents',
                    'verb' => ['POST', 'PATCH'],
                    'defaults' => ['paymentIntentId' => null],
                ]);

                $event->rules[] = new UrlRule([
                    'pattern' => 'freeform/payments/stripe/callback',
                    'route' => 'freeform/stripe-payment-intents/callback',
                    'verb' => ['GET'],
                ]);
            }
        );

        Event::on(
            UrlManager::class,
            UrlManager::EVENT_REGISTER_CP_URL_RULES,
            function (RegisterUrlRulesEvent $event) {
                $event->rules[] = new UrlRule([
                    'pattern' => 'freeform/api/stripe/fields/<category:[a-zA-Z0-9_]+>',
                    'route' => 'freeform/stripe-field-mapping',
                    'verb' => ['GET'],
                ]);
            }
        );
    }
}
