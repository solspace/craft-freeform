<?php

namespace Solspace\Freeform\Bundles\Form\Types\Surveys\EventListeners;

use craft\events\RegisterUrlRulesEvent;
use craft\web\UrlManager;
use craft\web\UrlRule;
use Solspace\Freeform\Bundles\Form\Types\Surveys\Controllers\ExportController;
use Solspace\Freeform\Bundles\Form\Types\Surveys\Controllers\SurveyPreferencesController;
use Solspace\Freeform\Bundles\Form\Types\Surveys\Controllers\SurveysController;
use Solspace\Freeform\Bundles\Form\Types\Surveys\Controllers\SurveySettingsController;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;

class RegisterControllers extends FeatureBundle
{
    public function __construct()
    {
        $this->registerController('surveys', SurveysController::class);
        $this->registerController('surveys-preferences', SurveyPreferencesController::class);
        $this->registerController('surveys-settings', SurveySettingsController::class);
        $this->registerController('surveys-export', ExportController::class);

        Event::on(
            UrlManager::class,
            UrlManager::EVENT_REGISTER_CP_URL_RULES,
            function (RegisterUrlRulesEvent $event) {
                $event->rules['freeform/surveys/<handle:.*>'] = 'freeform/forms';

                $event->rules[] = new UrlRule([
                    'pattern' => 'freeform/settings/surveys',
                    'route' => 'freeform/surveys-settings',
                    'verb' => ['GET'],
                ]);

                $event->rules[] = new UrlRule([
                    'pattern' => 'freeform/api/surveys/preferences/<id:[a-zA-Z0-9\-_]+>',
                    'route' => 'freeform/surveys-preferences',
                    'verb' => ['GET'],
                ]);

                $event->rules[] = new UrlRule([
                    'pattern' => 'freeform/api/surveys/preferences',
                    'route' => 'freeform/surveys-preferences',
                    'verb' => ['PUT'],
                ]);

                $event->rules[] = new UrlRule([
                    'pattern' => 'freeform/api/surveys/form/<handle:[a-zA-Z0-9\-_]+>',
                    'route' => 'freeform/surveys/results',
                    'verb' => ['GET'],
                ]);

                $event->rules[] = new UrlRule([
                    'pattern' => 'freeform/api/surveys/chart/<handle:[a-zA-Z0-9\-_]+>',
                    'route' => 'freeform/surveys/chart-data',
                    'verb' => ['GET'],
                ]);

                $event->rules[] = new UrlRule([
                    'pattern' => 'freeform/surveys/export/pdf',
                    'route' => 'freeform/surveys-export/pdf',
                    'verb' => ['POST'],
                ]);

                $event->rules[] = new UrlRule([
                    'pattern' => 'freeform/surveys/export/images',
                    'route' => 'freeform/surveys-export/images',
                    'verb' => ['POST'],
                ]);
            }
        );
    }
}
