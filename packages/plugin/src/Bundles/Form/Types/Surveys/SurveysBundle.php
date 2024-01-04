<?php

namespace Solspace\Freeform\Bundles\Form\Types\Surveys;

use craft\web\View;
use Solspace\Freeform\Events\Forms\Types\RegisterFormTypeEvent;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Services\Form\TypesService;
use yii\base\Event;

class SurveysBundle extends FeatureBundle
{
    public const PERMISSION_SURVEYS_ACCESS = 'freeform-surveys-access';
    public const PERMISSION_REPORTS_MANAGE = 'freeform-reports-manage';

    public function __construct()
    {
        Event::on(
            TypesService::class,
            TypesService::EVENT_REGISTER_FORM_TYPES,
            function (RegisterFormTypeEvent $event) {
                $event->addType(Survey::class);
            }
        );

        Event::on(
            View::class,
            View::EVENT_REGISTER_CP_TEMPLATE_ROOTS,
            function ($event) {
                $event->roots['freeform-surveys'] = __DIR__.'/Templates';
            }
        );
    }
}
