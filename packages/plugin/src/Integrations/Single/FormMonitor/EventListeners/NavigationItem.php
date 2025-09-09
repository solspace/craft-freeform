<?php

namespace Solspace\Freeform\Integrations\Single\FormMonitor\EventListeners;

use craft\events\RegisterUrlRulesEvent;
use craft\web\UrlManager;
use Solspace\Freeform\Events\Freeform\RegisterSettingsNavigationEvent;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Integrations\Single\FormMonitor\Controllers\FormMonitorController;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Services\SettingsService;
use yii\base\Event;

class NavigationItem extends FeatureBundle
{
    public function __construct()
    {
        Event::on(
            UrlManager::class,
            UrlManager::EVENT_REGISTER_CP_URL_RULES,
            [
                $this,
                'registerRoutes',
            ],
        );

        $this->registerController('form-monitor', FormMonitorController::class);

        // Add Form Monitor shortcut to settings nav
        Event::on(
            SettingsService::class,
            SettingsService::EVENT_REGISTER_SETTINGS_NAVIGATION,
            function (RegisterSettingsNavigationEvent $event) {
                $freeform = Freeform::getInstance();

                $event->addNavigationItem(
                    '../integrations/single/FormMonitor',
                    Freeform::t('Form Monitor'),
                    'notices-and-alerts'
                );
            }
        );
    }

    public function registerRoutes(RegisterUrlRulesEvent $event): void
    {
        $event->rules['freeform/form-monitor'] = 'freeform/app';
        $event->rules['freeform/form-monitor/<id:\d+>/tests'] = 'freeform/app';
        $event->rules['freeform/form-monitor/delete/me'] = 'freeform/form-monitor/delete-me';
        $event->rules['freeform/form-monitor/disable/me'] = 'freeform/form-monitor/disable-me';
        $event->rules['freeform/api/form-monitor/forms'] = 'freeform/form-monitor/available-forms';
        $event->rules['freeform/api/form-monitor/forms/<id:\d+>/stats'] = 'freeform/form-monitor/stats';
        $event->rules['freeform/api/form-monitor/forms/<id:\d+>/tests'] = 'freeform/form-monitor/tests';
        $event->rules['freeform/form-monitor/<id:\d+>/delete'] = 'freeform/form-monitor/delete';
        $event->rules['freeform/api/form-monitor/forms/<id:\d+>/disable'] = 'freeform/form-monitor/disable';
        $event->rules['freeform/api/form-monitor/forms/<id:\d+>/disable-and-clear'] = 'freeform/form-monitor/disable-and-clear';
        $event->rules['freeform/api/form-monitor/forms/<id:\d+>/enable'] = 'freeform/form-monitor/enable';
        $event->rules['freeform/api/form-monitor/forms/<id:\d+>/tests/<testId:\d+>'] = 'freeform/form-monitor/delete-test';
        $event->rules['freeform/api/form-monitor/forms/<id:\d+>/tests/all'] = 'freeform/form-monitor/clear-all-tests';
    }
}
