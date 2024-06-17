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

use Solspace\Freeform\Events\Forms\SendNotificationsEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Jobs\FreeformQueueHandler;
use Solspace\Freeform\Jobs\SendDynamicTemplateRecipientsNotificationsJob;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;

class DynamicTemplateRecipients extends FeatureBundle
{
    public const BAG_KEY = 'dynamicNotification';

    public function __construct(private FreeformQueueHandler $queueHandler)
    {
        Event::on(Form::class, Form::EVENT_SEND_NOTIFICATIONS, [$this, 'sendToRecipients']);
    }

    public function sendToRecipients(SendNotificationsEvent $event): void
    {
        if (!$event->isValid) {
            return;
        }

        $form = $event->getForm();
        if ($form->isDisabled()->userSelectNotifications) {
            return;
        }

        $data = $form->getProperties()->get(self::BAG_KEY);
        $recipients = $data['recipients'] ?? [];
        if (!$recipients) {
            return;
        }

        $this->queueHandler->executeNotificationJob(
            new SendDynamicTemplateRecipientsNotificationsJob([
                'submissionId' => $event->getSubmission()->getId(),
            ])
        );
    }
}
