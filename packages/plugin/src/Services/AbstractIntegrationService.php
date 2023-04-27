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
use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Events\Integrations\IntegrationResponseEvent;
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
    public const EVENT_FETCH_TYPES = 'fetchTypes';
    public const EVENT_BEFORE_PUSH = 'beforePush';
    public const EVENT_AFTER_PUSH = 'afterPush';
    public const EVENT_AFTER_RESPONSE = 'afterResponse';

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
    public function getIntegrationObjectById($id): IntegrationInterface
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
     */
    public function getIntegrationById($id): ?IntegrationModel
    {
        $data = $this->getQuery()->andWhere(['id' => $id])->one();

        if ($data) {
            return $this->createIntegrationModel($data);
        }

        return null;
    }

    /**
     * @param string $handle
     */
    public function getIntegrationByHandle(string $handle = null): ?IntegrationModel
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
            );
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
