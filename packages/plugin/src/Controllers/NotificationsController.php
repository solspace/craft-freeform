<?php
/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2022, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Controllers;

use Solspace\Commons\Helpers\PermissionHelper;
use Solspace\Commons\Helpers\StringHelper;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Exceptions\FreeformException;
use Solspace\Freeform\Records\NotificationRecord;
use Solspace\Freeform\Resources\Bundles\NotificationEditorBundle;
use Solspace\Freeform\Resources\Bundles\NotificationIndexBundle;
use Solspace\Freeform\Services\NotificationsService;
use yii\web\HttpException;
use yii\web\Response;

class NotificationsController extends BaseController
{
    public function actionIndex(): Response
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_NOTIFICATIONS_ACCESS);

        $this->view->registerAssetBundle(NotificationIndexBundle::class);

        $notifications = $this->getNotificationService()->getAllNotifications();

        return $this->renderTemplate(
            'freeform/notifications',
            [
                'notifications' => $notifications,
                'settings' => Freeform::getInstance()->settings->getSettingsModel(),
            ]
        );
    }

    public function actionCreateFile(): Response
    {
        $date = (new \DateTime())->format('Y-m-d');
        $name = "new-template-{$date}";

        $record = $this->getNotificationService()->createNewFileNotification($name);
        $record->name = "New Template on {$date}";
        $record->handle = $name;

        $title = Freeform::t('Create a new email notification template');

        return $this->renderEditForm($record, $title);
    }

    public function actionEdit(string $id): Response
    {
        $record = $this->getNotificationService()->getNotificationById($id);

        if (!$record) {
            throw new HttpException(
                404,
                Freeform::t('Notification with ID {id} not found', ['id' => $id])
            );
        }

        return $this->renderEditForm($record, $record->name);
    }

    public function actionSave()
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_NOTIFICATIONS_MANAGE);

        $request = \Craft::$app->request;
        $post = $request->post();

        $notificationId = $post['notificationId'] ?? null;
        $notification = $this->getNewOrExistingNotification($notificationId);

        $notification->name = $request->post('name');
        $notification->handle = $request->post('handle');
        $notification->description = $request->post('description');
        $notification->fromEmail = $request->post('fromEmail');
        $notification->fromName = $request->post('fromName');
        $notification->cc = $request->post('cc');
        $notification->bcc = $request->post('bcc');
        $notification->subject = $request->post('subject');
        $notification->replyToName = $request->post('replyToName');
        $notification->replyToEmail = $request->post('replyToEmail');
        $notification->bodyHtml = $request->post('bodyHtml');
        $notification->bodyText = $request->post('bodyText');
        $notification->autoText = (bool) $request->post('autoText');
        $notification->includeAttachments = (bool) $request->post('includeAttachments');
        $notification->presetAssets = $request->post('presetAssets');

        if ($this->getNotificationService()->save($notification)) {
            // Return JSON response if the request is an AJAX request
            if ($request->isAjax) {
                return $this->asJson(['success' => true]);
            }

            \Craft::$app->session->setNotice(Freeform::t('Notification saved'));
            \Craft::$app->session->setFlash(Freeform::t('Notification saved'), true);

            return $this->redirectToPostedUrl($notification);
        }

        // Return JSON response if the request is an AJAX request
        if ($request->isAjax) {
            return $this->asJson(['success' => false]);
        }

        \Craft::$app->session->setError(Freeform::t('Notification not saved'));

        // Send the event back to the template
        \Craft::$app->urlManager->setRouteParams(
            [
                'notification' => $notification,
                'errors' => $notification->getErrors(),
            ]
        );
    }

    public function actionDuplicate(): Response
    {
        $this->requirePostRequest();

        $id = $this->request->post('id');
        $notification = $this->getNotificationService()->getNotificationById($id);

        if (!$notification) {
            return $this->asJson(['success' => false, 'errors' => ['Notification doesn\'t exist']]);
        }

        $emailDirectory = $this->getSettingsService()->getSettingsModel()->getAbsoluteEmailTemplateDirectory();
        $original = $emailDirectory.'/'.$notification->filepath;
        $new = $emailDirectory.'/'.$notification->handle.'-copy.twig';
        copy($original, $new);

        return $this->asJson(['success' => true]);
    }

    public function actionDelete(): Response
    {
        $this->requirePostRequest();
        PermissionHelper::requirePermission(Freeform::PERMISSION_NOTIFICATIONS_MANAGE);

        $id = \Craft::$app->request->post('id');
        $this->getNotificationService()->deleteById($id);

        return $this->asJson(['success' => true]);
    }

    public function actionSendNotificationDialogue(): Response
    {
        $templates = ['' => '---'];
        foreach ($this->getNotificationService()->getAllNotifications(true) as $id => $notification) {
            $templates[$id] = $notification->name;
        }

        return $this->renderTemplate(
            'freeform/_components/modals/send_additional_notification',
            ['templates' => $templates]
        );
    }

    public function actionSendNotification(): Response
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

    private function renderEditForm(NotificationRecord $record, string $title): Response
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_NOTIFICATIONS_MANAGE);

        $this->view->registerAssetBundle(NotificationEditorBundle::class);

        $variables = [
            'notification' => $record,
            'title' => $title,
            'continueEditingUrl' => 'freeform/notifications/{id}',
        ];

        return $this->renderTemplate('freeform/notifications/edit', $variables);
    }

    private function getNotificationService(): NotificationsService
    {
        return Freeform::getInstance()->notifications;
    }

    private function getNewOrExistingNotification(mixed $id): NotificationRecord
    {
        if ($id) {
            $notification = $this->getNotificationService()->getNotificationById($id);

            if (!$notification) {
                throw new FreeformException(Freeform::t('Notification with ID {id} not found', ['id' => $id]));
            }
        } else {
            $notification = NotificationRecord::create();
        }

        return $notification;
    }
}
