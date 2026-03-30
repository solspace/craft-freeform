<?php

namespace Solspace\Freeform\Integrations\Single\UrlParameterTracking\EventListeners;

use Solspace\Freeform\Events\Submissions\SubmitEvent;
use Solspace\Freeform\Integrations\Single\UrlParameterTracking\Records\UrlTrackingParameterRecord;
use Solspace\Freeform\Integrations\Single\UrlParameterTracking\Services\UrlParameterTrackingResolver;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Services\SubmissionsService;
use yii\base\Event;

class UrlParameterTrackingTrigger extends FeatureBundle
{
    public function __construct(
        private UrlParameterTrackingResolver $resolver,
    ) {
        Event::on(
            SubmissionsService::class,
            SubmissionsService::EVENT_AFTER_SUBMIT,
            [$this, 'onStoreSubmission']
        );
    }

    public function onStoreSubmission(SubmitEvent $event): void
    {
        $form = $event->getForm();
        $submission = $event->getSubmission();

        $trackedParameters = $this->resolver->resolveForForm($form);
        if (empty($trackedParameters)) {
            return;
        }

        \Craft::$app->db
            ->createCommand()
            ->batchInsert(
                UrlTrackingParameterRecord::TABLE,
                ['submissionId', 'name', 'value'],
                array_map(
                    static fn (string $name, string $value) => [$submission->getId(), $name, $value],
                    array_keys($trackedParameters),
                    $trackedParameters
                )
            )
            ->execute()
        ;
    }
}
