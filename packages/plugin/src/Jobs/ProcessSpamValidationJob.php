<?php

namespace Solspace\Freeform\Jobs;

use craft\queue\BaseJob;
use Solspace\Freeform\Bundles\Form\SpamControl\SpamControl;
use Solspace\Freeform\Bundles\Integrations\Providers\FormIntegrationsProvider;
use Solspace\Freeform\Events\Integrations\ProcessPostedValuesEvent;
use Solspace\Freeform\Events\Submissions\SubmitEvent;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Integrations\Types\SpamBlocking\AsyncSpamBlockingIntegrationInterface;
use yii\base\Event;

class ProcessSpamValidationJob extends BaseJob implements AiFieldsJobInterface
{
    public ?int $formId = null;
    public ?int $submissionId = null;
    public array $postedData = [];
    public bool $displayErrors = false;

    public function execute($queue): void
    {
        $freeform = Freeform::getInstance();
        $integrationProvider = \Craft::$container->get(FormIntegrationsProvider::class);
        $spamControl = \Craft::$container->get(SpamControl::class);

        $form = $freeform->forms->getFormById($this->formId);
        $submission = $freeform->submissions->getSubmissionById($this->submissionId);

        if ($submission) {
            $form->setSubmission($submission);
        }

        $event = new ProcessPostedValuesEvent($form, $submission, $this->postedData);
        Event::trigger(FormJobInterface::class, FormJobInterface::EVENT_PROCESS_POSTED_DATA, $event);

        $form->valuesFromArray($event->getValues());

        $integrations = $integrationProvider->getForForm($form, AsyncSpamBlockingIntegrationInterface::class);
        foreach ($integrations as $integration) {
            $integration->validate($form, $this->displayErrors);
        }

        if ($form->isMarkedAsSpam()) {
            $submission->isSpam = true;
            $event = new SubmitEvent($form, $submission);
            $spamControl->persistSpamReasons($event);

            \Craft::$app->elements->saveElement($submission, false, false, true);
        }
    }

    protected function defaultDescription(): ?string
    {
        return Freeform::t('Freeform: Processing Spam Validation');
    }
}
