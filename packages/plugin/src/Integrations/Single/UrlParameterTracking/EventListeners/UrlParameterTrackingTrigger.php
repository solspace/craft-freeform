<?php

namespace Solspace\Freeform\Integrations\Single\UrlParameterTracking\EventListeners;

use Solspace\Freeform\Bundles\Integrations\Providers\FormIntegrationsProvider;
use Solspace\Freeform\Events\Forms\SubmitEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Integrations\Single\UrlParameterTracking\Records\UrlTrackingParameterRecord;
use Solspace\Freeform\Integrations\Single\UrlParameterTracking\UrlParameterTracking;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;

class UrlParameterTrackingTrigger extends FeatureBundle
{
    public function __construct(
        private FormIntegrationsProvider $integrationsProvider,
    ) {
        Event::on(
            Form::class,
            Form::EVENT_AFTER_SUBMIT,
            [$this, 'onFormSubmit']
        );
    }

    public function onFormSubmit(SubmitEvent $event): void
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
                    fn (string $name, string $value) => [$submission->getId(), $name, $value],
                    array_keys($trackedParameters),
                    $trackedParameters
                )
            )
            ->execute()
        ;
    }
}
