<?php

namespace Solspace\Freeform\Services\Notifications;

use Solspace\Freeform\Events\Notifications\SaveWrapperEvent;
use Solspace\Freeform\Records\Notifications\NotificationWrapperRecord;
use Solspace\Freeform\Services\BaseService;

class NotificationWrappersService extends BaseService
{
    public const EVENT_BEFORE_SAVE = 'before-save';
    public const EVENT_AFTER_SAVE = 'after-save';

    public function getAll(): array
    {
        return NotificationWrapperRecord::find()->all();
    }

    public function getById(int $id): ?NotificationWrapperRecord
    {
        return NotificationWrapperRecord::findOne(['id' => $id]);
    }

    public function save(NotificationWrapperRecord $record): bool
    {
        $event = new SaveWrapperEvent($record);
        $this->trigger(self::EVENT_BEFORE_SAVE, $event);

        if (!$record->save()) {
            return false;
        }

        $this->trigger(self::EVENT_AFTER_SAVE, $event);

        return true;
    }

    public function delete(int $id): bool
    {
        $record = $this->getById($id);
        if (!$record) {
            return false;
        }

        return (bool) $record->delete();
    }
}
