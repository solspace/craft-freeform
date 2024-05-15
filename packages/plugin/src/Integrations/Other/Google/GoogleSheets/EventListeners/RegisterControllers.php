<?php

namespace Solspace\Freeform\Integrations\Other\Google\GoogleSheets\EventListeners;

use craft\events\RegisterUrlRulesEvent;
use craft\web\UrlManager;
use Solspace\Freeform\Integrations\Other\Google\GoogleSheets\Controllers\GoogleSheetsController;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;
use yii\web\UrlRule;

class RegisterControllers extends FeatureBundle
{
    public function __construct()
    {
        $this->registerController('google-sheets', GoogleSheetsController::class);

        Event::on(
            UrlManager::class,
            UrlManager::EVENT_REGISTER_CP_URL_RULES,
            function (RegisterUrlRulesEvent $event) {
                $event->rules[] = new UrlRule([
                    'pattern' => 'freeform/api/google-sheets/sheets',
                    'route' => 'freeform/google-sheets/sheets',
                    'verb' => ['GET'],
                ]);

                $event->rules[] = new UrlRule([
                    'pattern' => 'freeform/api/google-sheets/column-fields',
                    'route' => 'freeform/google-sheets/column-fields',
                    'verb' => ['GET'],
                ]);
            }
        );
    }
}
