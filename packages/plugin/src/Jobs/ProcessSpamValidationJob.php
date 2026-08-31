<?php

namespace Solspace\Freeform\Jobs;

use craft\queue\BaseJob;
use Solspace\Freeform\Bundles\Form\SpamControl\SpamControl;
use Solspace\Freeform\Bundles\Integrations\Providers\FormIntegrationsProvider;
use Solspace\Freeform\Events\Forms\SubmitEvent as FormSubmitEvent;
use Solspace\Freeform\Events\Integrations\ProcessPostedValuesEvent;
use Solspace\Freeform\Events\Submissions\SubmitEvent;
use Solspace\Freeform\Form\Form;
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
        if (!$form) {
            return;
        }

        $submission = $this->submissionId
            ? $freeform->submissions->getSubmissionById($this->submissionId)
            : null;

        if (!$submission) {
            return;
        }

        $form->setSubmission($submission);

        $event = new ProcessPostedValuesEvent($form, $submission, $this->postedData);
        Event::trigger(FormJobInterface::class, FormJobInterface::EVENT_PROCESS_POSTED_DATA, $event);

        $form->valuesFromArray($event->getValues());

        $originalIsSpam = $form->isMarkedAsSpam();

        $integrations = $integrationProvider->getForForm($form, AsyncSpamBlockingIntegrationInterface::class);
        foreach ($integrations as $integration) {
            $integration->validate($form, $this->displayErrors);
        }

        if ($form->isMarkedAsSpam()) {
            $submission->isSpam = true;
            $spamEvent = new SubmitEvent($form, $submission);
            $spamControl->persistSpamReasons($spamEvent);

            \Craft::$app->elements->saveElement($submission, false, false, true);

            if (!$originalIsSpam) {
                $form->removeMarkedAsSpam();
            }

            return;
        }

        // Only run outbound side effects here when the form opted into holding them.
        if (!$integrationProvider->shouldDeferPostProcessForAsyncSpam($form)) {
            return;
        }

        $form->markAsyncSpamValidated();
        $freeform->submissions->postProcessSubmission($form, $submission);

        Event::trigger(
            Form::class,
            Form::EVENT_AFTER_ASYNC_SPAM_VALIDATION,
            new FormSubmitEvent($form)
        );
    }

    protected function defaultDescription(): ?string
    {
        return Freeform::t('Freeform: Processing Spam Validation');
    }
}
