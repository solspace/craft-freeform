<?php
/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2024, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Bundles\Notifications\SendListeners;

use Solspace\Freeform\Bundles\Notifications\Providers\NotificationsProvider;
use Solspace\Freeform\Events\Forms\SendNotificationsEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Jobs\FreeformQueueHandler;
use Solspace\Freeform\Jobs\SendEmailRecipientNotificationsJob;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Notifications\Types\EmailField\EmailField;
use yii\base\Event;

class EmailRecipientNotifications extends FeatureBundle
{
    public function __construct(
        private NotificationsProvider $notificationsProvider,
        private FreeformQueueHandler $queueHandler
    ) {
        Event::on(Form::class, Form::EVENT_SEND_NOTIFICATIONS, [$this, 'sendToRecipients']);
    }

    public function sendToRecipients(SendNotificationsEvent $event): void
    {
        if (!$event->isValid) {
            return;
        }

        $form = $event->getForm();
        if ($form->isDisabled()->emailFieldNotifications) {
            return;
        }

        if (!$this->notificationsProvider->getByFormAndClass($form, EmailField::class)) {
            return;
        }

        $this->queueHandler->executeNotificationJob(
            new SendEmailRecipientNotificationsJob([
                'submissionId' => $event->getSubmission()->getId(),
            ])
        );
    }
}
