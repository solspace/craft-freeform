<?php

namespace Solspace\Freeform\Services\Notifications;

use craft\helpers\StringHelper;
use Solspace\Freeform\Events\Notifications\SaveEvent;
use Solspace\Freeform\Records\NotificationRecord;
use Solspace\Freeform\Services\BaseService;
use Solspace\Freeform\Services\NotificationsService;
use yii\base\Event;

class NotificationDatabaseService extends BaseService implements NotificationsServiceInterface
{
    public function getAll(bool $indexById = true): array
    {
        $records = NotificationRecord::find()->indexBy('id')->all();

        if (!$indexById) {
            return array_values($records);
        }

        return $records;
    }

    public function getById(mixed $id): ?NotificationRecord
    {
        return NotificationRecord::find()->where(['id' => $id])->one();
    }

    public function save(NotificationRecord $record): bool
    {
        $isNew = !$record->id;

        // Replace all &nbsp; occurrences with a blank space, since it might mess up
        // Twig parsing. These non-breakable spaces are caused by the HTML editor
        $record->bodyHtml = str_replace('&nbsp;', ' ', $record->bodyHtml);

        $event = new SaveEvent($record, $isNew);
        Event::trigger(NotificationsService::class, self::EVENT_BEFORE_SAVE, $event);
        $this->trigger(self::EVENT_BEFORE_SAVE, $event);

        $record->validate();

        if (!$record->hasErrors()) {
            $transaction = \Craft::$app->getDb()->getTransaction() ?? \Craft::$app->getDb()->beginTransaction();

            try {
                $record->save(false);
                $transaction?->commit();

                $event = new SaveEvent($record, $isNew);
                Event::trigger(NotificationsService::class, self::EVENT_AFTER_SAVE, $event);
                $this->trigger(self::EVENT_AFTER_SAVE, $event);

                return true;
            } catch (\Exception $e) {
                $transaction?->rollBack();

                throw $e;
            }
        }

        return false;
    }

    public function create(string $name): NotificationRecord
    {
        $record = NotificationRecord::create();
        $record->name = $name;
        $record->handle = StringHelper::toCamelCase($name);

        $this->save($record);

        return $record;
    }

    public function delete(mixed $id): bool
    {
        $record = $this->getById($id);

        return (bool) $record?->delete();
    }
}
