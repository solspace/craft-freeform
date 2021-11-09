<?php

namespace Solspace\Freeform\Bundles\Form\Context\Request;

use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\FormEventInterface;
use Solspace\Freeform\Events\Forms\ResetEvent;
use Solspace\Freeform\Fields\CheckboxField;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Composer\Components\Form;
use yii\base\Event;

class EditSubmissionContext
{
    const TOKEN_KEY = 'submissionToken';

    public function __construct()
    {
        Event::on(Form::class, Form::EVENT_BEFORE_HANDLE_REQUEST, [$this, 'applySubmissionToForm']);
        Event::on(Form::class, Form::EVENT_REGISTER_CONTEXT, [$this, 'applySubmissionToForm']);
        Event::on(Form::class, Form::EVENT_BEFORE_RESET, [$this, 'skipResetOnEdit']);
    }

    public static function getToken(Form $form)
    {
        return $form->getPropertyBag()->get(self::TOKEN_KEY);
    }

    public function skipResetOnEdit(ResetEvent $event)
    {
        if (!$event->isValid) {
            return;
        }

        $token = self::getToken($event->getForm());
        if ($token) {
            $event->isValid = false;
        }
    }

    public function applySubmissionToForm(FormEventInterface $event)
    {
        $form = $event->getForm();
        $token = self::getToken($event->getForm());
        if (!$token) {
            return;
        }

        $submission = Freeform::getInstance()->submissions->getSubmissionByToken($token);
        if (!$submission instanceof Submission) {
            return;
        }

        $form->disableAjaxReset();
        foreach ($form->getLayout()->getFields() as $field) {
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
