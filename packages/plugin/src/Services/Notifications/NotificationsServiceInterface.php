<?php

namespace Solspace\Freeform\Services\Notifications;

use Solspace\Freeform\Records\NotificationTemplateRecord;

interface NotificationsServiceInterface
{
    public const EVENT_BEFORE_SAVE = 'beforeSave';
    public const EVENT_AFTER_SAVE = 'afterSave';
    public const EVENT_BEFORE_DELETE = 'beforeDelete';
    public const EVENT_AFTER_DELETE = 'afterDelete';

    /**
     * @return NotificationTemplateRecord[]
     */
    public function getAll(bool $indexById = true): array;

    public function getById(mixed $id): ?NotificationTemplateRecord;

    public function save(NotificationTemplateRecord $record): bool;

    public function delete(mixed $id): bool;

    public function create(string $name): NotificationTemplateRecord;
}
