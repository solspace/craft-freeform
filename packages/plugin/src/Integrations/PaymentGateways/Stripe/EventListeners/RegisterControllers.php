<?php

namespace Solspace\Freeform\Integrations\PaymentGateways\Stripe\EventListeners;

use craft\events\RegisterUrlRulesEvent;
use craft\web\UrlManager;
use Solspace\Freeform\Integrations\PaymentGateways\Stripe\Controllers\CallbackController;
use Solspace\Freeform\Integrations\PaymentGateways\Stripe\Controllers\FieldMappingController;
use Solspace\Freeform\Integrations\PaymentGateways\Stripe\Controllers\PaymentIntentsController;
use Solspace\Freeform\Integrations\PaymentGateways\Stripe\Controllers\StripeCustomerController;
use Solspace\Freeform\Integrations\PaymentGateways\Stripe\Controllers\StripeScriptsController;
use Solspace\Freeform\Integrations\PaymentGateways\Stripe\Controllers\StripeWebhookController;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;
use yii\web\UrlRule;

class RegisterControllers extends FeatureBundle
{
    public function __construct()
    {
        $this->registerController('stripe-payment-intents', PaymentIntentsController::class);
        $this->registerController('stripe-callback', CallbackController::class);
        $this->registerController('stripe-customers', StripeCustomerController::class);
        $this->registerController('stripe-field-mapping', FieldMappingController::class);
        $this->registerController('stripe-webhook', StripeWebhookController::class);
        $this->registerController('stripe-scripts', StripeScriptsController::class);

        Event::on(
            UrlManager::class,
            UrlManager::EVENT_REGISTER_SITE_URL_RULES,
            function (RegisterUrlRulesEvent $event) {
                $event->rules[] = new UrlRule([
                    'pattern' => 'freeform/payments/stripe/payment-intents',
                    'route' => 'freeform/stripe-payment-intents/create',
                    'verb' => ['POST'],
                ]);

                $event->rules[] = new UrlRule([
                    'pattern' => 'freeform/payments/stripe/payment-intents/<paymentIntentId:[a-zA-Z0-9_]+>/amount',
                    'route' => 'freeform/stripe-payment-intents/update-amount',
                    'verb' => ['POST'],
                ]);

                $event->rules[] = new UrlRule([
                    'pattern' => 'freeform/payments/stripe/payment-intents/<paymentIntentId:[a-zA-Z0-9_]+>/customers',
                    'route' => 'freeform/stripe-customers/customer',
                    'verb' => ['POST'],
                ]);

                $event->rules[] = new UrlRule([
                    'pattern' => 'freeform/payments/stripe/callback',
                    'route' => 'freeform/stripe-callback/callback',
                    'verb' => ['GET'],
                ]);

                $event->rules[] = new UrlRule([
                    'pattern' => 'freeform/payments/stripe/webhook',
                    'route' => 'freeform/stripe-webhook/webhooks',
                    'verb' => ['POST', 'GET'],
                ]);

                $event->rules[] = new UrlRule([
                    'pattern' => 'freeform/scripts/stripe.js',
                    'route' => 'freeform/stripe-scripts',
                    'verb' => ['GET'],
                ]);
            }
        );

        Event::on(
            UrlManager::class,
            UrlManager::EVENT_REGISTER_CP_URL_RULES,
            function (RegisterUrlRulesEvent $event) {
                $event->rules[] = new UrlRule([
                    'pattern' => 'freeform/api/stripe/fields/<id:[a-zA-Z0-9_]+>',
                    'route' => 'freeform/stripe-field-mapping',
                    'verb' => ['GET'],
                ]);
            }
        );
    }
}
