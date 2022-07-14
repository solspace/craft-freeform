<?php

namespace Solspace\Freeform\Controllers\notifications;

use Solspace\Commons\Helpers\StringHelper;
use Solspace\Freeform\Controllers\BaseController;
use Solspace\Freeform\Freeform;
use yii\web\Response;

class SenderController extends BaseController
{
    public function actionDialogue(): Response
    {
        $templates = ['' => '---'];
        foreach ($this->getNotificationsService()->getAllNotifications(true) as $id => $notification) {
            $templates[$id] = $notification->name;
        }

        return $this->renderTemplate(
            'freeform/_components/modals/send_additional_notification',
            ['templates' => $templates]
        );
    }

    public function actionSend(): Response
    {
        $template = $this->request->post('template');
        if (!$template) {
            $this->response->statusCode = 400;

            return $this->asJson('Please select a template');
        }

        $emails = $this->request->post('emails');
        $emails = StringHelper::extractSeparatedValues($emails);
        if (empty($emails)) {
            $this->response->statusCode = 400;

            return $this->asJson('No emails specified');
        }

        $submissionIds = $this->request->post('submissionIds', []);
        if (empty($submissionIds)) {
            return $this->asJson(true);
        }

        foreach ($submissionIds as $submissionId) {
            $submission = $this->getSubmissionsService()->getSubmissionById($submissionId);
            if (!$submission) {
                continue;
            }

            $form = $submission->getForm();

            $notification = Freeform::getInstance()
                ->notifications
                ->requireNotification(
                    $form,
                    $template,
                    'Send notification from CP Submissions Index page'
                )
            ;

            if (!$notification) {
                continue;
            }

            $fields = $form->getLayout()->getFields();
            foreach ($fields as $field) {
                $handle = $field->getHandle();
                if (!$handle) {
                    continue;
                }

                if (isset($submission[$handle])) {
                    $field->setValue($submission[$handle]->getValue());
                }
            }

            $this->getMailerService()->sendEmail(
                $form,
                $emails,
                $notification,
                $fields,
                $submission
            );
        }

        return $this->asJson(true);
    }
}
