<?php

namespace Solspace\Freeform\Bundles\Form\Context\Request;

use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\Forms\HandleRequestEvent;
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
        Event::on(Form::class, Form::EVENT_BEFORE_HANDLE_REQUEST, [$this, 'handleRequest']);
        Event::on(Form::class, Form::EVENT_RENDER_BEFORE_OPEN_TAG, [$this, 'handleRender']);
    }

    public function handleRequest(HandleRequestEvent $event)
    {
        $form = $event->getForm();
        $token = $form->getAssociatedSubmissionToken();

        $this->applySubmissionToForm($form, $token);
    }

    public function handleRender(RenderTagEvent $event)
    {
        $form = $event->getForm();
        $token = $form->getPropertyBag()->get(self::SUBMISSION_TOKEN_KEY);

        $this->applySubmissionToForm($form, $token);
    }

    private function applySubmissionToForm(Form $form, string $token = null)
    {
        if (!$token) {
            return;
        }

        $submission = Freeform::getInstance()->submissions->getSubmissionByToken($token);
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
