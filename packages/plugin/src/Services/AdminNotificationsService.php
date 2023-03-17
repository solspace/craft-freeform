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

namespace Solspace\Freeform\Services;

use Psr\Http\Message\ResponseInterface;
use Solspace\Freeform\Library\Database\NotificationHandlerInterface;
use Solspace\Freeform\Library\Notifications\AbstractNotification;
use Solspace\Freeform\Records\NotificationRecord;

class AdminNotificationsService extends AbstractNotificationService implements NotificationHandlerInterface
{
    private static ?array $integrations = null;

    public function onAfterResponse(AbstractNotification $notification, ResponseInterface $response)
    {
        // TODO: Implement onAfterResponse() method.
    }

    protected function getNotificationType(): string
    {
        return NotificationRecord::TYPE_ADMIN;
    }

    // TODO - Implement other functionality similar to NotificationsService
}
