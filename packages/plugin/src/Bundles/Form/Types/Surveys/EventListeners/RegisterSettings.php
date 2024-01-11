<?php

namespace Solspace\Freeform\Bundles\Form\Types\Surveys\EventListeners;

use Solspace\Commons\Helpers\PermissionHelper;
use Solspace\Freeform\Bundles\Form\Types\Surveys\SurveysBundle;
use Solspace\Freeform\Events\Freeform\RegisterSettingsNavigationEvent;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Services\SettingsService;
use yii\base\Event;

class RegisterSettings extends FeatureBundle
{
    public function __construct()
    {
        Event::on(
            SettingsService::class,
            SettingsService::EVENT_REGISTER_SETTINGS_NAVIGATION,
            function (RegisterSettingsNavigationEvent $event) {
                $allowAdminChanges = \Craft::$app->getConfig()->getGeneral()->allowAdminChanges;
                if (!$allowAdminChanges) {
                    return;
                }

                if (!PermissionHelper::checkPermission(SurveysBundle::PERMISSION_SURVEYS_ACCESS)) {
                    return;
                }

                $event->addHeader('form-types', Freeform::t('Form Types'), 'spam');
                $event->addNavigationItem('surveys', 'Surveys & Polls', 'form-types');
            }
        );
    }

    public static function isProOnly(): bool
    {
        return true;
    }
}
