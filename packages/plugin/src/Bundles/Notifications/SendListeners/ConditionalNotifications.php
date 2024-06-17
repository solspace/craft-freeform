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
use Solspace\Freeform\Jobs\SendConditionalNotificationsJob;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Notifications\Types\Conditional\Conditional;
use yii\base\Event;

class ConditionalNotifications extends FeatureBundle
{
    public function __construct(
        private NotificationsProvider $notificationsProvider,
        private FreeformQueueHandler $queueHandler
    ) {
        Event::on(
            Form::class,
            Form::EVENT_SEND_NOTIFICATIONS,
            [$this, 'sendToRecipients']
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

        if (!$this->notificationsProvider->getByFormAndClass($form, Conditional::class)) {
            return;
        }

        $this->queueHandler->executeNotificationJob(
            new SendConditionalNotificationsJob([
                'submissionId' => $event->getSubmission()->getId(),
            ])
        );
    }
}
