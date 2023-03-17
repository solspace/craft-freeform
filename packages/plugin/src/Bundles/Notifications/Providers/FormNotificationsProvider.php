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

namespace Solspace\Freeform\Bundles\Notifications\Providers;

use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Records\Form\FormNotificationRecord;
use Solspace\Freeform\Services\NotificationsService;

class FormNotificationsProvider
{
    public function __construct(
        private NotificationsService $notificationsService
    ) {
    }

    public function getForForm(?Form $form = null): array
    {
        $notifications = $this->notificationsService->getAllNotifications();

        /** @var FormNotificationRecord[] $formNotificationRecords */
        $formNotificationRecords = FormNotificationRecord::find()
            ->where(['formId' => $form?->getId() ?? null])
            ->indexBy('notificationId')
            ->all()
        ;

        foreach ($notifications as $notification) {
            $formNotification = $formNotificationRecords[$notification->id] ?? null;
            if (!$formNotification) {
                continue;
            }

            $metadata = json_decode($formNotification->metadata ?? '{}', true);

            $notification->enabled = $formNotification->enabled;
            $notification->metadata = array_merge(
                $notification->metadata,
                $metadata
            );
        }

        return $notifications;
    }
}
