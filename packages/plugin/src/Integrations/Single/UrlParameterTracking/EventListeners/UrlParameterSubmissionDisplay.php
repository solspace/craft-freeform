<?php

namespace Solspace\Freeform\Integrations\Single\UrlParameterTracking\EventListeners;

use craft\web\View;
use Solspace\Freeform\Integrations\Single\UrlParameterTracking\Records\UrlTrackingParameterRecord;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;

class UrlParameterSubmissionDisplay extends FeatureBundle
{
    public function __construct()
    {
        Event::on(
            View::class,
            View::EVENT_REGISTER_CP_TEMPLATE_ROOTS,
            function ($event) {
                $event->roots['freeform-url-parameters'] = __DIR__.'/../Templates';
            }
        );

        \Craft::$app->view->hook(
            'freeform.submissions.edit.sidepanel',
            [$this, 'renderSidepanel']
        );
    }

    public function renderSidepanel(array &$context): ?string
    {
        $submission = $context['submission'];

        $trackingParameters = UrlTrackingParameterRecord::find()
            ->where(['submissionId' => $submission->id])
            ->orderBy(['name' => \SORT_ASC])
            ->asArray()
            ->all()
        ;

        if (!$trackingParameters) {
            return null;
        }

        return \Craft::$app->view->renderTemplate(
            'freeform-url-parameters/url-parameters-side-panel',
            ['trackingParameters' => $trackingParameters],
        );
    }
}
