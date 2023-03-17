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

use craft\db\Query;
use Solspace\Freeform\Bundles\Attributes\Property\PropertyProvider;
use Solspace\Freeform\Events\Notifications\DeleteEvent;
use Solspace\Freeform\Events\Notifications\SaveEvent;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Exceptions\Notifications\NotificationException;
use Solspace\Freeform\Library\Exceptions\Notifications\NotificationNotFoundException;
use Solspace\Freeform\Library\Notifications\NotificationInterface;
use Solspace\Freeform\Models\NotificationModel;
use Solspace\Freeform\Records\NotificationRecord;

class NotificationsService extends BaseService
{
    public const EVENT_BEFORE_SAVE = 'beforeSave';
    public const EVENT_AFTER_SAVE = 'afterSave';
    public const EVENT_BEFORE_DELETE = 'beforeDelete';
    public const EVENT_AFTER_DELETE = 'afterDelete';

    public function __construct(
        $config = [],
        private PropertyProvider $propertyProvider,
    ) {
        parent::__construct($config);
    }

    /**
     * @return array
     * @throws NotificationException
     */
    public function getAllNotifications(): array
    {
        $results = $this->getQuery()->all();

        $models = [];
        foreach ($results as $result) {
            $model = $this->createNotificationModel($result);

            try {
                $model->getNotificationObject();
                $models[] = $model;
            } catch (NotificationNotFoundException $e) {
            }
        }

        return $models;
    }

    /**
     * @param int $id
     * @return NotificationModel|null
     */
    public function getById(int $id): ?NotificationModel
    {
        $result = $this->getQuery()->where(['id' => $id])->one();
        if (!$result) {
            return null;
        }

        return $this->createNotificationModel($result);
    }

    /**
     * @param string $handle
     * @return NotificationModel|null
     */
    public function getByHandle(string $handle): ?NotificationModel
    {
        $result = $this->getQuery()->where(['handle' => $handle])->one();
        if (!$result) {
            return null;
        }

        return $this->createNotificationModel($result);
    }

    /**
     * @param NotificationModel $model
     * @return bool
     * @throws NotificationException
     * @throws \yii\db\Exception
     */
    public function save(NotificationModel $model): bool
    {
        $isNew = !$model->id;

        $beforeSaveEvent = new SaveEvent($model, $isNew);
        $this->trigger(self::EVENT_BEFORE_SAVE, $beforeSaveEvent);

        if ($isNew) {
            $record = new NotificationRecord();
        } else {
            $record = NotificationRecord::findOne(['id' => $model->id]);

            if (!$record) {
                throw new NotificationException(
                    Freeform::t('Email Marketing notification with ID {id} not found', ['id' => $model->id])
                );
            }
        }

        $record->name = $model->name;
        $record->handle = $model->handle;
        $record->type = $model->type;
        $record->class = $model->class;
        $record->lastUpdate = new \DateTime();
        $record->metadata = $model->metadata;

        $record->validate();
        $model->addErrors($record->getErrors());

        if ($beforeSaveEvent->isValid && !$model->hasErrors()) {
            $transaction = \Craft::$app->getDb()->beginTransaction();

            try {
                $record->save(false);

                if ($isNew) {
                    $model->id = $record->id;
                }

                $transaction?->commit();

                $this->trigger(self::EVENT_AFTER_SAVE, new SaveEvent($model, $isNew));

                return true;
            } catch (\Exception $e) {
                $transaction?->rollBack();

                throw $e;
            }
        }

        return false;
    }

    /**
     * @param int $id
     * @return bool
     * @throws \yii\db\Exception
     */
    public function delete(int $id): bool
    {
        $model = $this->getById($id);
        if (!$model) {
            return false;
        }

        $beforeDeleteEvent = new DeleteEvent($model);
        $this->trigger(self::EVENT_BEFORE_DELETE, $beforeDeleteEvent);

        if (!$beforeDeleteEvent->isValid) {
            return false;
        }

        $transaction = \Craft::$app->getDb()->beginTransaction();

        try {
            $affectedRows = \Craft::$app->getDb()
                ->createCommand()
                ->delete(NotificationRecord::TABLE, ['id' => $model->id])
                ->execute()
            ;

            $transaction?->commit();

            $this->trigger(self::EVENT_AFTER_DELETE, new DeleteEvent($model));

            return (bool) $affectedRows;
        } catch (\Exception $exception) {
            $transaction?->rollBack();

            throw $exception;
        }
    }

    /**
     * @param NotificationModel $model
     * @return void
     * @throws \yii\base\Exception
     * @throws \yii\base\InvalidConfigException
     */
    public function decryptModelValues(NotificationModel $model)
    {
        $securityKey = \Craft::$app->getConfig()->getGeneral()->securityKey;

        if (!$model->class) {
            return;
        }

        $properties = $this->propertyProvider->getEditableProperties($model->class);
        foreach ($properties as $property) {
            if (!$property->hasFlag(NotificationInterface::FLAG_ENCRYPTED)) {
                continue;
            }

            $value = $model->metadata[$property->handle];
            if ($value) {
                $value = \Craft::$app->security->decryptByKey(base64_decode($value), $securityKey);
            }

            $model->metadata[$property->handle] = $value;
        }
    }

    /**
     * @param NotificationModel $model
     * @return void
     * @throws \yii\base\Exception
     * @throws \yii\base\InvalidConfigException
     */
    public function parsePostedModelData(NotificationModel $model): void
    {
        $securityKey = \Craft::$app->getConfig()->getGeneral()->securityKey;

        $editableProperties = $this->propertyProvider->getEditableProperties($model->class);
        foreach ($editableProperties as $property) {
            $handle = $property->handle;
            $value = $model->metadata[$handle] ?? null;

            if ($value && $property->hasFlag(NotificationInterface::FLAG_ENCRYPTED)) {
                $value = base64_encode(\Craft::$app->security->encryptByKey($value, $securityKey));

                $model->metadata[$property->handle] = $value;
            }
        }
    }

    /**
     * @param NotificationModel $model
     * @param NotificationInterface $integration
     * @return void
     * @throws \ReflectionException
     * @throws \yii\base\Exception
     * @throws \yii\base\InvalidConfigException
     */
    public function updateModelFromNotification(NotificationModel $model, NotificationInterface $integration)
    {
        $securityKey = \Craft::$app->getConfig()->getGeneral()->securityKey;

        $editableProperties = $this->propertyProvider->getEditableProperties($model->class);
        $reflection = new \ReflectionClass($model->class);
        foreach ($editableProperties as $property) {
            if ($property->hasFlag(NotificationInterface::FLAG_READONLY)) {
                continue;
            }

            $handle = $property->handle;
            $instanceProperty = $reflection->getProperty($handle);
            $value = $instanceProperty->getValue($integration);

            if (!$value && $property->required) {
                $model->addError(
                    $model->class.$handle,
                    Freeform::t('{key} is required', ['key' => $property->label])
                );

                continue;
            }

            if ($property->hasFlag(NotificationInterface::FLAG_ENCRYPTED)) {
                $value = base64_encode(\Craft::$app->security->encryptByKey($value, $securityKey));
            }

            $model->metadata[$property->handle] = $value;
        }
    }

    /**
     * @return Query
     */
    protected function getQuery(): Query
    {
        return (new Query())
            ->select(
                [
                    'notification.id',
                    'notification.name',
                    'notification.handle',
                    'notification.type',
                    'notification.class',
                    'notification.metadata',
                    'notification.lastUpdate',
                ]
            )
            ->from(NotificationRecord::TABLE.' notification')
            ->orderBy(['id' => \SORT_ASC])
            ;
    }

    /**
     * @param array $data
     * @return NotificationModel
     */
    protected function createNotificationModel(array $data): NotificationModel
    {
        return new NotificationModel($data);
    }
}
