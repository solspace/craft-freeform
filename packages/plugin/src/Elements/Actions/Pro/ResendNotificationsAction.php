<?php

namespace Solspace\Freeform\Elements\Actions\Pro;

use craft\base\ElementAction;
use craft\elements\db\ElementQueryInterface;
use craft\web\View;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\Forms\SendNotificationsEvent;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\NoStorageInterface;
use Solspace\Freeform\Library\Composer\Components\Form;
use yii\base\Event;

class ResendNotificationsAction extends ElementAction
{
    public function getTriggerLabel(): string
    {
        return Freeform::t('Resend Notifications');
    }

    public function performAction(ElementQueryInterface $query): bool
    {
        $templateMode = \Craft::$app->view->getTemplateMode();
        \Craft::$app->view->setTemplateMode(View::TEMPLATE_MODE_SITE);

        $mailer = Freeform::getInstance()->mailer;

        /** @var Submission $submission */
        foreach ($query->all() as $submission) {
            $form = $submission->getForm();

            $fields = $form->getLayout()->getFields();
            foreach ($fields as $field) {
                if ($field instanceof NoStorageInterface) {
                    continue;
                }

                $submissionField = $submission->{$field->getHandle()};
                if (!$submissionField) {
                    continue;
                }

                $value = $submissionField->getValue();
                $field->setValue($value);
            }

            $event = new SendNotificationsEvent($form, $submission, $mailer, $fields);
            Event::trigger(Form::class, Form::EVENT_SEND_NOTIFICATIONS, $event);
        }

        $this->setMessage('Notifications sent successfully');

        \Craft::$app->view->setTemplateMode($templateMode);

        return true;
    }
}
