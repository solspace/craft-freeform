<?php

/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2026, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Bundles\Notifications\SendListeners;

use Solspace\Freeform\Bundles\Notifications\Providers\NotificationsProvider;
use Solspace\Freeform\Bundles\Rules\Types\NotificationRuleValidator;
use Solspace\Freeform\Events\Forms\SendNotificationsEvent;
use Solspace\Freeform\Events\Mailer\SendEmailEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Jobs\FreeformQueueHandler;
use Solspace\Freeform\Jobs\SendNotificationsJob;
use Solspace\Freeform\Notifications\Types\Conditional\Conditional;
use Solspace\Freeform\Services\MailerService;
use yii\base\Event;

class ConditionalNotifications extends NotificationListener
{
    public function __construct(
        private NotificationsProvider $notificationsProvider,
        private NotificationRuleValidator $ruleValidator,
        private FreeformQueueHandler $queueHandler
    ) {
        Event::on(
            Form::class,
            Form::EVENT_SEND_NOTIFICATIONS,
            [$this, 'sendToRecipients']
        );

        Event::on(
            MailerService::class,
            MailerService::EVENT_BEFORE_SEND,
            [$this, 'checkRulesBeforeSend'],
        );
    }

    public static function isProOnly(): bool
    {
        return true;
    }

    public function sendToRecipients(SendNotificationsEvent $event): void
    {
        if (!$event->isValid) {
            return;
        }

        $form = $event->getForm();
        if ($form->isDisabled()->conditionalNotifications) {
            return;
        }

        $notifications = $this->notificationsProvider->getByFormAndClass($form, Conditional::class);
        if (!$notifications) {
            return;
        }

        $postedData = $event->getSubmission()->getFormFieldValues();

        foreach ($notifications as $notification) {
            $recipients = $notification->getRecipients();
            $template = $notification->getTemplate();

            [$recipients, $template] = $this->getProcessedRecipientsAndTemplate(
                $form,
                $notification,
                $recipients,
                $template,
            );

            if (!$recipients->count() || !$template) {
                continue;
            }

            $this->queueHandler->executeNotificationJob(
                new SendNotificationsJob([
                    'formId' => $form->getId(),
                    'submissionId' => $event->getSubmission()->id,
                    'siteId' => $event->getSiteId(),
                    'postedData' => $postedData,
                    'recipients' => $recipients,
                    'template' => $template,
                    'notificationType' => Conditional::class,
                    'notificationId' => $notification->getId(),
                ])
            );
        }
    }

    public function checkRulesBeforeSend(SendEmailEvent $event): void
    {
        $form = $event->getForm();
        $notification = $event->getNotificationRecord();
        if (!$notification instanceof Conditional) {
            return;
        }

        $rulesPass = $this->ruleValidator->isPassing($notification, $form);
        if (!$rulesPass) {
            $event->isValid = false;
        }
    }
}
