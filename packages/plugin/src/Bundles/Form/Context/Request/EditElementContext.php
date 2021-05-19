<?php

namespace Solspace\Freeform\Bundles\Form\Context\Request;

use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\Forms\RenderTagEvent;
use Solspace\Freeform\Fields\CheckboxField;
use Solspace\Freeform\Fields\DynamicRecipientField;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Composer\Components\Form;
use yii\base\Event;

class EditElementContext
{
    const SUBMISSION_TOKEN_KEY = 'submissionToken';

    public function __construct()
    {
        Event::on(Form::class, Form::EVENT_RENDER_BEFORE_OPEN_TAG, [$this, 'handleRequest']);
    }

    public function handleRequest(RenderTagEvent $event)
    {
        $form = $event->getForm();
        $submissionToken = $form->getPropertyBag()->get(self::SUBMISSION_TOKEN_KEY);
        if (!$submissionToken) {
            return;
        }

        $submission = Freeform::getInstance()->submissions->getSubmissionByToken($submissionToken);
        if (!$submission instanceof Submission) {
            return;
        }

        $form->disableAjaxReset();
        foreach ($form->getLayout()->getFields() as $field) {
            if ($field instanceof DynamicRecipientField) {
                continue;
            }

            if (isset($submission->{$field->getHandle()})) {
                $submissionField = $submission->{$field->getHandle()};
                $value = $submissionField->getValue();

                if ($submissionField instanceof CheckboxField) {
                    $field->setIsCheckedByPost((bool) $value);
                }

                $field->setValue($value);
            }
        }
    }
}
