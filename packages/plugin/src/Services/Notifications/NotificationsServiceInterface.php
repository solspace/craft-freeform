<?php

namespace Solspace\Freeform\Services\Notifications;

use Solspace\Freeform\Records\NotificationRecord;

interface NotificationsServiceInterface
{
    public const EVENT_BEFORE_SAVE = 'beforeSave';
    public const EVENT_AFTER_SAVE = 'afterSave';
    public const EVENT_BEFORE_DELETE = 'beforeDelete';
    public const EVENT_AFTER_DELETE = 'afterDelete';

    /**
     * @return NotificationRecord[]
     */
    public function getAll(bool $indexById = true): array;

    public function getById(mixed $id): ?NotificationRecord;

    public function save(NotificationRecord $record): bool;

    public function delete(mixed $id): bool;
}
