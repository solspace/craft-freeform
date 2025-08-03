<?php

namespace Solspace\Freeform\Bundles\Backup\Export\FormieV3\Notifications;

use Solspace\Freeform\Bundles\Backup\Collections\NotificationCollection;
use Solspace\Freeform\Bundles\Backup\DTO\Notification;
use Solspace\Freeform\Library\Helpers\HashHelper;
use Solspace\Freeform\Notifications\Types\Admin\Admin;

class FormieNotificationProcessor
{
    public function processNotifications($form, string $formUid): NotificationCollection
    {
        $collection = new NotificationCollection();

        try {
            $notifications = $form->getNotifications();
        } catch (\Throwable $e) {
            $notifications = [];
        }

        foreach ($notifications as $notification) {
            $notificationDto = new Notification();
            $notificationDto->id = $notification->id;
            $notificationDto->uid = HashHelper::sha1($formUid.'notification'.$notification->id, 32);
            $notificationDto->name = $notification->name ?? 'Notification';
            $notificationDto->type = Admin::class;
            $notificationDto->idAttribute = 'template';
            $notificationDto->enabled = $notification->enabled ?? true;

            $notificationDto->metadata = [
                'name' => $notification->name ?? 'Admin Notification',
                'fromName' => $notification->fromName ?? '',
                'fromEmail' => $notification->fromEmail ?? '',
                'replyTo' => $notification->replyTo ?? '',
                'subject' => $notification->subject ?? 'Form submission',
                'body' => $notification->message ?? '',
                'to' => $notification->to ?? '',
                'cc' => $notification->cc ?? '',
                'bcc' => $notification->bcc ?? '',
                'template' => 'default',
            ];

            $collection->add($notificationDto);
        }

        return $collection;
    }
}
