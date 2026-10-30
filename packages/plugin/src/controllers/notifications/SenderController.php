<?php

namespace Solspace\Freeform\controllers\notifications;

use Solspace\Freeform\Bundles\Notifications\Providers\AdditionalNotificationRecipientsProvider;
use Solspace\Freeform\Bundles\Notifications\Providers\NotificationLoggerProvider;
use Solspace\Freeform\Controllers\BaseController;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Library\DataObjects\NotificationTemplate;
use Solspace\Freeform\Library\Helpers\StringHelper;
use Solspace\Freeform\Notifications\Components\Recipients\RecipientCollection;
use yii\web\BadRequestHttpException;
use yii\web\ForbiddenHttpException;
use yii\web\Response;

class SenderController extends BaseController
{
    public function actionDialogue(): Response
    {
        $this->requireCpRequest();
        $templates = ['' => '---'];
        foreach ($this->getNotificationsService()->getAllNotifications() as $id => $notification) {
            $templates[$id] = $notification->name;
        }

        $provider = \Craft::$container->get(AdditionalNotificationRecipientsProvider::class);
        $submissions = $this->getSelectedSubmissions();
        $choices = [];
        foreach ($submissions as $submission) {
            $form = $submission->getForm();
            if (!$form) {
                continue;
            }
            $form->valuesFromSubmission($submission);
            foreach ($provider->getChoices($form) as $key => $choice) {
                $choices[$key] ??= ['email' => $choice['email'], 'sources' => [], 'templates' => [], 'count' => 0, 'configuredCount' => 0];
                ++$choices[$key]['count'];
                $choices[$key]['configuredCount'] += $choice['configuredCount'];
                $choices[$key]['sources'] = array_values(array_unique(array_merge($choices[$key]['sources'], $choice['sources']), \SORT_REGULAR));
                $choices[$key]['templates'] = array_values(array_unique(array_merge($choices[$key]['templates'], $choice['configuredTemplates'])));
            }
        }

        return $this->renderTemplate(
            'freeform/_components/modals/send_additional_notification',
            ['templates' => $templates, 'recipients' => $choices, 'submissionCount' => \count($submissions)]
        );
    }

    public function actionSend(): Response
    {
        $this->requirePostRequest();
        $this->requireCpRequest();
        $mode = $this->request->post('templateMode', 'custom');
        if (!\in_array($mode, ['custom', 'configured'], true)) {
            throw new BadRequestHttpException('Invalid template mode');
        }
        $template = $this->request->post('template', '');
        $emails = $this->request->post('emails', '');
        $selectedEmails = $this->request->post('selectedEmails', []);
        if (!\is_string($emails) || !\is_array($selectedEmails) || !\is_string($template)) {
            throw new BadRequestHttpException('Invalid email addresses');
        }
        $emails = StringHelper::extractSeparatedValues($emails);
        foreach (array_merge($emails, $selectedEmails) as $email) {
            if (!\is_string($email) || !filter_var($email, \FILTER_VALIDATE_EMAIL)) {
                throw new BadRequestHttpException('Invalid email address');
            }
        }
        if (!$template && ('custom' === $mode || $emails)) {
            $this->response->statusCode = 400;

            return $this->asJson('Please select a template');
        }

        $submissions = $this->getSelectedSubmissions();
        $provider = \Craft::$container->get(AdditionalNotificationRecipientsProvider::class);
        $notificationsBySubmission = [];
        foreach ($submissions as $submission) {
            $form = $submission->getForm();
            if (!$form) {
                continue;
            }
            $form->valuesFromSubmission($submission);
            $notifications = 'configured' === $mode
                ? $provider->getSelectedConfiguredNotifications($form, $selectedEmails)
                : [];
            $recipients = $provider->getSelectedRecipients($form, 'custom' === $mode ? $selectedEmails : [], $emails);
            if ($recipients->count()) {
                $record = $this->getNotificationsService()->requireNotification($form, $template, 'Send notification from CP Submissions Index page');
                if (!$record) {
                    throw new BadRequestHttpException('The selected template is no longer available');
                }
                $customTemplate = NotificationTemplate::fromRecord($record);
                // Do not send an additional copy when the typed address already
                // receives this same template through a selected configuration.
                $alreadyIncluded = [];
                foreach ($notifications as $notification) {
                    if ((string) $notification['template']->getId() === (string) $customTemplate->getId()) {
                        foreach ($notification['recipients']->emailsToArray() as $email) {
                            $alreadyIncluded[strtolower($email)] = true;
                        }
                    }
                }
                $uniqueEmails = array_filter($recipients->emailsToArray(), static fn (string $email) => !isset($alreadyIncluded[strtolower($email)]));
                if ($uniqueEmails) {
                    $notifications[] = ['recipients' => RecipientCollection::fromArray($uniqueEmails), 'template' => $customTemplate, 'notification' => null];
                }
            }
            if ($notifications) {
                $notificationsBySubmission[$submission->id] = $notifications;
            }
        }

        if (!$notificationsBySubmission) {
            $this->response->statusCode = 400;

            return $this->asJson('No emails specified');
        }

        $loggerProvider = \Craft::$container->get(NotificationLoggerProvider::class);

        foreach ($submissions as $submission) {
            $notifications = $notificationsBySubmission[$submission->id] ?? [];
            if (!$notifications) {
                continue;
            }

            $form = $submission->getForm();
            $form->valuesFromSubmission($submission);

            foreach ($notifications as $notification) {
                $logger = $loggerProvider->getLogger($notification['notification'] ?? $notification['template'], $form);
                $this->getMailerService()->sendEmail(
                    $form,
                    $notification['recipients'],
                    $notification['template'],
                    $submission,
                    [],
                    $logger,
                    $notification['notification'],
                );
            }
        }

        return $this->asJson(true);
    }

    /** @return Submission[] */
    private function getSelectedSubmissions(): array
    {
        $ids = $this->request->getParam('submissionIds', []);
        if (!\is_array($ids)) {
            throw new BadRequestHttpException('Invalid submission IDs');
        }

        $submissions = [];
        foreach ($ids as $id) {
            if (!\is_scalar($id) || !ctype_digit((string) $id)) {
                throw new BadRequestHttpException('Invalid submission ID');
            }
            $submission = $this->getSubmissionsService()->getSubmissionById((int) $id);
            if (!$submission) {
                continue;
            }
            if (!$submission->getIsEditable()) {
                throw new ForbiddenHttpException('User is not permitted to send notifications for this submission');
            }
            $submissions[$submission->id] = $submission;
        }

        return $submissions;
    }
}
