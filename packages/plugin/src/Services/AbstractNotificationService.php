<?php
/**
 * Created by PhpStorm.
 * User: gustavs
 * Date: 30/08/2017
 * Time: 17:29.
 */

namespace Solspace\Freeform\Services;

use craft\db\Query;
use Psr\Http\Message\ResponseInterface;
use Solspace\Freeform\Events\Notifications\NotificationResponseEvent;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Database\NotificationHandlerInterface;
use Solspace\Freeform\Library\Exceptions\Notifications\NotificationException;
use Solspace\Freeform\Library\Exceptions\Notifications\NotificationNotFoundException;
use Solspace\Freeform\Library\Notifications\AbstractNotification;
use Solspace\Freeform\Library\Notifications\NotificationInterface;
use Solspace\Freeform\Models\NotificationModel;
use Solspace\Freeform\Records\NotificationRecord;

abstract class AbstractNotificationService extends BaseService implements NotificationHandlerInterface
{
    public const EVENT_FETCH_TYPES = 'fetchTypes';

    public const EVENT_BEFORE_PUSH = 'beforePush';

    public const EVENT_AFTER_PUSH = 'afterPush';

    public const EVENT_AFTER_RESPONSE = 'afterResponse';

    /**
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
     * @throws NotificationException
     */
    public function getAllNotificationObjects(): array
    {
        $models = $this->getAllNotifications();

        $notifications = [];
        foreach ($models as $model) {
            $notifications[] = $model->getNotificationObject();
        }

        return $notifications;
    }

    /**
     * @throws NotificationException
     * @throws NotificationNotFoundException
     */
    public function getNotificationObjectById($id): NotificationInterface
    {
        $model = $this->getNotificationById($id);

        if ($model) {
            return $model->getNotificationObject();
        }

        throw new NotificationException(
            Freeform::t('Notification with ID {id} not found', ['id' => $id])
        );
    }

    public function getNotificationById($id): ?NotificationModel
    {
        $data = $this->getQuery()->andWhere(['id' => $id])->one();

        if ($data) {
            return $this->createNotificationModel($data);
        }

        return null;
    }

    public function getNotificationByHandle(string $handle = null): ?NotificationModel
    {
        $data = $this->getQuery()->andWhere(['handle' => $handle])->one();

        if ($data) {
            return $this->createNotificationModel($data);
        }

        return null;
    }

    /**
     * Flag the given notification so that it's updated the next time it's accessed.
     */
    public function flagNotificationForUpdating(AbstractNotification $notification)
    {
        \Craft::$app
            ->getDb()
            ->createCommand()
            ->update(
                NotificationRecord::TABLE,
                ['forceUpdate' => true],
                'id = :id',
                ['id' => $notification->getId()]
            )
        ;
    }

    public function onAfterResponse(AbstractNotification $notification, ResponseInterface $response)
    {
        $event = new NotificationResponseEvent($notification, $response);
        $this->trigger(self::EVENT_AFTER_RESPONSE, $event);
    }

    /**
     * Return the notification type - Admin or Conditional.
     */
    abstract protected function getNotificationType(): string;

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
            ->where(['type' => $this->getNotificationType()])
            ->orderBy(['id' => \SORT_ASC])
        ;
    }

    protected function createNotificationModel(array $data): NotificationModel
    {
        return new NotificationModel($data);
    }
}
