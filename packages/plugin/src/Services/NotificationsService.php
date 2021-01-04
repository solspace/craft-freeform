<?php
/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2021, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Services;

use Solspace\Commons\Helpers\PermissionHelper;
use Solspace\Freeform\Events\Notifications\DeleteEvent;
use Solspace\Freeform\Events\Notifications\SaveEvent;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Exceptions\DataObjects\EmailTemplateException;
use Solspace\Freeform\Records\NotificationRecord;

class NotificationsService extends BaseService
{
    const EVENT_BEFORE_SAVE = 'beforeSave';
    const EVENT_AFTER_SAVE = 'afterSave';
    const EVENT_BEFORE_DELETE = 'beforeDelete';
    const EVENT_AFTER_DELETE = 'afterDelete';

    /** @var NotificationRecord[] */
    private static $notificationCache;

    /** @var bool */
    private static $allNotificationsLoaded;

    /**
     * @param bool $indexById
     *
     * @return NotificationRecord[]
     */
    public function getAllNotifications($indexById = true): array
    {
        $cacheIsNull = null === self::$notificationCache;

        if ($cacheIsNull || !self::$allNotificationsLoaded) {
            /** @var NotificationRecord[] $records */
            $records = NotificationRecord::find()->all();

            if ($cacheIsNull) {
                self::$notificationCache = [];
            }

            foreach ($records as $record) {
                self::$notificationCache[$record->id] = $record;
            }

            $settings = Freeform::getInstance()->settings->getSettingsModel();
            foreach ($settings->listTemplatesInEmailTemplateDirectory() as $filePath => $name) {
                try {
                    $model = NotificationRecord::createFromTemplate($filePath);

                    self::$notificationCache[$model->filepath] = $model;
                } catch (EmailTemplateException $exception) {
                    \Craft::$app->session->setError(
                        Freeform::t(
                            '{template}: {message}',
                            [
                                'template' => $name,
                                'message' => $exception->getMessage(),
                            ]
                        )
                    );
                }
            }

            self::$allNotificationsLoaded = true;
        }

        if (!$indexById) {
            return array_values(self::$notificationCache);
        }

        return self::$notificationCache;
    }

    /**
     * @param int $id
     *
     * @return null|NotificationRecord
     */
    public function getNotificationById($id)
    {
        if (null === self::$notificationCache || !isset(self::$notificationCache[$id])) {
            if (is_numeric($id)) {
                $record = NotificationRecord::find()->where(['id' => $id])->one();
            } else {
                $record = NotificationRecord::find()->where(['handle' => $id])->one();
            }

            self::$notificationCache[$id] = $record;

            if (!$record) {
                $settings = Freeform::getInstance()->settings->getSettingsModel();
                foreach ($settings->listTemplatesInEmailTemplateDirectory() as $filePath => $name) {
                    if ($id === $name) {
                        try {
                            $record = NotificationRecord::createFromTemplate($filePath);

                            self::$notificationCache[$id] = $record;
                        } catch (EmailTemplateException $exception) {
                            \Craft::$app->session->setError(
                                Freeform::t(
                                    '{template}: {message}',
                                    [
                                        'template' => $name,
                                        'message' => $exception->getMessage(),
                                    ]
                                )
                            );
                        }
                    }
                }
            }
        }

        return self::$notificationCache[$id];
    }

    /**
     * @throws \Exception
     */
    public function save(NotificationRecord $record): bool
    {
        $isNew = !$record->id;

        // Replace all &nbsp; occurrences with a blank space, since it might mess up
        // Twig parsing. These non-breakable spaces are caused by the HTML editor
        $record->bodyHtml = str_replace('&nbsp;', ' ', $record->bodyHtml);

        $this->trigger(self::EVENT_BEFORE_SAVE, new SaveEvent($record, $isNew));

        $record->validate();

        if (!$record->hasErrors()) {
            $transaction = \Craft::$app->getDb()->getTransaction() ?? \Craft::$app->getDb()->beginTransaction();

            try {
                $record->save(false);

                self::$notificationCache[$record->id] = $record;

                if (null !== $transaction) {
                    $transaction->commit();
                }

                $this->trigger(self::EVENT_AFTER_SAVE, new SaveEvent($record, $isNew));

                return true;
            } catch (\Exception $e) {
                if (null !== $transaction) {
                    $transaction->rollBack();
                }

                throw $e;
            }
        }

        return false;
    }

    /**
     * @param int $notificationId
     *
     * @throws \Exception
     */
    public function deleteById($notificationId): bool
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_NOTIFICATIONS_MANAGE);

        $record = $this->getNotificationById($notificationId);

        if (!$record) {
            return false;
        }

        $beforeDeleteEvent = new DeleteEvent($record);
        $this->trigger(self::EVENT_BEFORE_DELETE, $beforeDeleteEvent);

        if (!$beforeDeleteEvent->isValid) {
            return false;
        }

        $transaction = \Craft::$app->getDb()->getTransaction() ?? \Craft::$app->getDb()->beginTransaction();

        try {
            $affectedRows = \Craft::$app->getDb()
                ->createCommand()
                ->delete(NotificationRecord::TABLE, ['id' => $record->id])
                ->execute()
            ;

            if (null !== $transaction) {
                $transaction->commit();
            }

            $this->trigger(self::EVENT_AFTER_DELETE, new DeleteEvent($record));

            return (bool) $affectedRows;
        } catch (\Exception $exception) {
            if (null !== $transaction) {
                $transaction->rollback();
            }

            throw $exception;
        }
    }
}
