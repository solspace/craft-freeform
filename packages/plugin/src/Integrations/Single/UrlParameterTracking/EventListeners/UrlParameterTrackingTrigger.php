<?php

namespace Solspace\Freeform\Integrations\Single\UrlParameterTracking\EventListeners;

use Solspace\Freeform\Bundles\Integrations\Providers\FormIntegrationsProvider;
use Solspace\Freeform\Events\Submissions\SubmitEvent;
use Solspace\Freeform\Integrations\Single\UrlParameterTracking\Records\UrlTrackingParameterRecord;
use Solspace\Freeform\Integrations\Single\UrlParameterTracking\UrlParameterTracking;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Services\SubmissionsService;
use yii\base\Event;

class UrlParameterTrackingTrigger extends FeatureBundle
{
    public function __construct(
        private FormIntegrationsProvider $integrationsProvider,
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

        $integration = $this->integrationsProvider->getSingleton($form, UrlParameterTracking::class);
        if (!$integration) {
            return;
        }

        $parameters = $integration->getCombinedParameters();

        // Get clean $_GET parameters from the parameters defined here
        $trackedParameters = [];
        foreach ($parameters as $parameter) {
            if (isset($_GET[$parameter])) {
                $trackedParameters[$parameter] = htmlspecialchars($_GET[$parameter], \ENT_QUOTES, 'UTF-8');
            }
        }

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
