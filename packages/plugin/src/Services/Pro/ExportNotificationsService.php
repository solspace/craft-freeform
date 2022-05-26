<?php

namespace Solspace\Freeform\Services\Pro;

use Solspace\Freeform\Events\Export\Notifications\DeleteEvent;
use Solspace\Freeform\Events\Export\Notifications\SaveEvent;
use Solspace\Freeform\Records\Pro\ExportNotificationRecord;
use yii\base\Component;

class ExportNotificationsService extends Component
{
    public const EVENT_BEFORE_SAVE = 'beforeSave';
    public const EVENT_AFTER_SAVE = 'afterSave';
    public const EVENT_BEFORE_DELETE = 'beforeDelete';
    public const EVENT_AFTER_DELETE = 'afterDelete';

    /**
     * @return ExportNotificationRecord[]
     */
    public function getAll(): array
    {
        return ExportNotificationRecord::find()->all();
    }

    public function getAllById(): array
    {
        return ExportNotificationRecord::find()
            ->indexBy('id')
            ->asArray()
            ->all()
        ;
    }

    public function getAllNamesById(): array
    {
        return ExportNotificationRecord::find()
            ->select('name')
            ->indexBy('id')
            ->asArray()
            ->column()
        ;
    }

    /**
     * @return null|ExportNotificationRecord
     */
    public function getById(int $id = null)
    {
        return ExportNotificationRecord::findOne(['id' => $id]);
    }

    public function save(ExportNotificationRecord $record): bool
    {
        $record->validate();

        $beforeSaveEvent = new SaveEvent($record);
        $this->trigger(self::EVENT_BEFORE_SAVE, $beforeSaveEvent);

        if ($beforeSaveEvent->isValid && !$record->hasErrors()) {
            $record->save(false);
            $this->trigger(self::EVENT_AFTER_SAVE, new SaveEvent($record));

            return true;
        }

        return false;
    }

    public function deleteById(int $id): bool
    {
        $record = $this->getById($id);
        if (!$record) {
            return false;
        }

        $beforeDeleteEvent = new DeleteEvent($record);
        $this->trigger(self::EVENT_BEFORE_DELETE, $beforeDeleteEvent);

        if (!$beforeDeleteEvent->isValid) {
            return false;
        }

        $record->delete();
        $this->trigger(self::EVENT_AFTER_DELETE, new DeleteEvent($record));

        return true;
    }
}
