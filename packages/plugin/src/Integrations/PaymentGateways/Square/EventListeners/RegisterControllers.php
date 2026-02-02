<?php

namespace Solspace\Freeform\Integrations\PaymentGateways\Square\EventListeners;

use craft\events\RegisterUrlRulesEvent;
use craft\web\UrlManager;
use Solspace\Freeform\Integrations\PaymentGateways\Square\Controllers\PaymentsController;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;
use yii\web\UrlRule;

class RegisterControllers extends FeatureBundle
{
    public function __construct()
    {
        $this->registerController('square-payments', PaymentsController::class);

        Event::on(
            UrlManager::class,
            UrlManager::EVENT_REGISTER_SITE_URL_RULES,
            static function (RegisterUrlRulesEvent $event) {
                $event->rules[] = new UrlRule([
                    'pattern' => 'freeform/payments/square/payments',
                    'route' => 'freeform/square-payments/create',
                    'verb' => ['POST'],
                ]);
            }
        );
    }
}
