<?php

namespace Solspace\Freeform\Bundles\Form\Submissions;

use Solspace\Freeform\Events\Forms\HandleRequestEvent;
use Solspace\Freeform\Fields\Implementations\FileUploadField;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;

class PopulateSubmission extends FeatureBundle
{
    public function __construct()
    {
        Event::on(
            Form::class,
            Form::EVENT_AFTER_HANDLE_REQUEST,
            [$this, 'populateSubmissionValues']
        );
    }

    public static function getPriority(): int
    {
        return 1;
    }

    public function populateSubmissionValues(HandleRequestEvent $event): void
    {
        $form = $event->getForm();
        $submission = $form->getSubmission();
        $generalSettings = $form->getSettings()->getGeneral();

        if (!$submission) {
            return;
        }

        $fields = $form->getLayout()->getFields()->getStorableFields();

        $data = [];
        foreach ($fields as $field) {
            if (!$form->hasFieldBeenSubmitted($field)) {
                continue;
            }

            if ($field instanceof FileUploadField && $submission->id && empty($field->getValue())) {
                continue;
            }

            $data[$field->getHandle()] = $field->getValue();
        }

        $submission->setFormFieldValues($data);

        $dateCreated = new \DateTime();
        if (!$submission->id) {
            $collectIps = $generalSettings->collectIpAddresses;

            $submission->ip = $collectIps ? \Craft::$app->request->getUserIP() : null;
            $submission->formId = $form->getId();
            $submission->isSpam = $form->isMarkedAsSpam();
            $submission->dateCreated = $dateCreated;
            $submission->statusId = $generalSettings->defaultStatus;
        }

        $submission->title = \Craft::$app->view->renderString(
            $generalSettings->submissionTitle,
            array_merge(
                $data,
                [
                    'dateCreated' => $dateCreated,
                    'form' => $form,
                ]
            )
        );
    }
}
