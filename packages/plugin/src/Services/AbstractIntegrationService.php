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
use Solspace\Commons\Helpers\PermissionHelper;
use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Bundles\Attributes\Property\PropertyProvider;
use Solspace\Freeform\Events\Integrations\DeleteEvent;
use Solspace\Freeform\Events\Integrations\IntegrationResponseEvent;
use Solspace\Freeform\Events\Integrations\SaveEvent;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Database\IntegrationHandlerInterface;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationNotFoundException;
use Solspace\Freeform\Library\Integrations\AbstractIntegration;
use Solspace\Freeform\Library\Integrations\IntegrationInterface;
use Solspace\Freeform\Models\IntegrationModel;
use Solspace\Freeform\Records\IntegrationRecord;

abstract class AbstractIntegrationService extends BaseService implements IntegrationHandlerInterface
{
    public const EVENT_BEFORE_SAVE = 'beforeSave';
    public const EVENT_AFTER_SAVE = 'afterSave';
    public const EVENT_BEFORE_DELETE = 'beforeDelete';
    public const EVENT_AFTER_DELETE = 'afterDelete';
    public const EVENT_FETCH_TYPES = 'fetchTypes';
    public const EVENT_BEFORE_PUSH = 'beforePush';
    public const EVENT_AFTER_PUSH = 'afterPush';
    public const EVENT_AFTER_RESPONSE = 'afterResponse';

    public function __construct(
        $config = [],
        private PropertyProvider $propertyProvider,
    ) {
        parent::__construct($config);
    }

    /**
     * @return IntegrationModel[]
     */
    public function getAllIntegrations(): array
    {
        $results = $this->getQuery()->all();

        $models = [];
        foreach ($results as $result) {
            $model = $this->createIntegrationModel($result);

            try {
                $model->getIntegrationObject();
                $models[] = $model;
            } catch (IntegrationNotFoundException $e) {
            }
        }

        return $models;
    }

    /**
     * @return AbstractIntegration[]
     */
    public function getAllIntegrationObjects(): array
    {
        $models = $this->getAllIntegrations();

        $integrations = [];
        foreach ($models as $model) {
            $integrations[] = $model->getIntegrationObject();
        }

        return $integrations;
    }

    /**
     * @param int $id
     *
     * @throws IntegrationException
     */
    public function getIntegrationObjectById($id): AbstractIntegration
    {
        $model = $this->getIntegrationById($id);

        if ($model) {
            return $model->getIntegrationObject();
        }

        throw new IntegrationException(
            Freeform::t('Integration with ID {id} not found', ['id' => $id])
        );
    }

    /**
     * @param int $id
     *
     * @return null|IntegrationModel
     */
    public function getIntegrationById($id)
    {
        $data = $this->getQuery()->andWhere(['id' => $id])->one();

        if ($data) {
            return $this->createIntegrationModel($data);
        }

        return null;
    }

    /**
     * @param string $handle
     *
     * @return null|IntegrationModel
     */
    public function getIntegrationByHandle(string $handle = null)
    {
        $data = $this->getQuery()->andWhere(['handle' => $handle])->one();

        if ($data) {
            return $this->createIntegrationModel($data);
        }

        return null;
    }

    /**
     * Flag the given mailing list integration so that it's updated the next time it's accessed.
     */
    public function flagIntegrationForUpdating(AbstractIntegration $integration)
    {
        \Craft::$app
            ->getDb()
            ->createCommand()
            ->update(
                IntegrationRecord::TABLE,
                ['forceUpdate' => true],
                'id = :id',
                ['id' => $integration->getId()]
            )
        ;
    }

    public function updateModelFromIntegration(IntegrationModel $model, IntegrationInterface $integration)
    {
        $securityKey = \Craft::$app->getConfig()->getGeneral()->securityKey;

        $editableProperties = $this->propertyProvider->getEditableProperties($model->class);
        $reflection = new \ReflectionClass($model->class);
        foreach ($editableProperties as $property) {
            if ($property->hasFlag(IntegrationInterface::FLAG_READONLY)) {
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

            if ($property->hasFlag(IntegrationInterface::FLAG_ENCRYPTED)) {
                $value = base64_encode(\Craft::$app->security->encryptByKey($value, $securityKey));
            }

            $model->metadata[$property->handle] = $value;
        }
    }

    public function save(IntegrationModel $model): bool
    {
        $isNew = !$model->id;

        $beforeSaveEvent = new SaveEvent($model, $isNew);
        $this->trigger(self::EVENT_BEFORE_SAVE, $beforeSaveEvent);

        if ($isNew) {
            $record = new IntegrationRecord();
        } else {
            $record = IntegrationRecord::findOne(['id' => $model->id, 'type' => $this->getIntegrationType()]);

            if (!$record) {
                throw new IntegrationException(
                    Freeform::t('Email Marketing integration with ID {id} not found', ['id' => $model->id])
                );
            }
        }

        $record->name = $model->name;
        $record->handle = $model->handle;
        $record->type = $this->getIntegrationType();
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
     *
     * @return bool
     *
     * @throws \Exception
     */
    public function delete($id)
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_SETTINGS_ACCESS);

        $model = $this->getIntegrationById($id);
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
                ->delete(IntegrationRecord::TABLE, ['id' => $model->id])
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
     * {@inheritDoc}
     */
    public function onAfterResponse(AbstractIntegration $integration, ResponseInterface $response)
    {
        $event = new IntegrationResponseEvent($integration, $response);
        $this->trigger(self::EVENT_AFTER_RESPONSE, $event);
    }

    /**
     * Return the integration type
     * MailingList or Crm.
     */
    abstract protected function getIntegrationType(): string;

    protected function getQuery(): Query
    {
        return (new Query())
            ->select(
                [
                    'integration.id',
                    'integration.name',
                    'integration.handle',
                    'integration.type',
                    'integration.class',
                    'integration.metadata',
                    'integration.lastUpdate',
                ]
            )
            ->from(IntegrationRecord::TABLE.' integration')
            ->where(['type' => $this->getIntegrationType()])
            ->orderBy(['id' => \SORT_ASC])
        ;
    }

    protected function createIntegrationModel(array $data): IntegrationModel
    {
        return new IntegrationModel($data);
    }
}
