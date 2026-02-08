<?php

namespace Solspace\Freeform\Integrations\PaymentGateways\Mollie\EventListeners;

use craft\events\RegisterUrlRulesEvent;
use craft\web\UrlManager;
use Solspace\Freeform\Integrations\PaymentGateways\Mollie\Controllers\MolliePaymentController;
use Solspace\Freeform\Integrations\PaymentGateways\Mollie\Controllers\MollieWebhookController;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;
use yii\web\UrlRule;

class RegisterControllers extends FeatureBundle
{
    public function __construct()
    {
        $this->registerController('mollie', MolliePaymentController::class);
        $this->registerController('mollie-webhook', MollieWebhookController::class);

        Event::on(
            UrlManager::class,
            UrlManager::EVENT_REGISTER_SITE_URL_RULES,
            static function (RegisterUrlRulesEvent $event) {
                $event->rules[] = new UrlRule([
                    'pattern' => 'freeform/payments/mollie/create',
                    'route' => 'freeform/mollie/index',
                    'verb' => ['POST'],
                ]);

                $event->rules[] = new UrlRule([
                    'pattern' => 'freeform/payments/mollie/webhook',
                    'route' => 'freeform/mollie-webhook/index',
                    'verb' => ['POST'],
                ]);
            }
        );
    }
}
