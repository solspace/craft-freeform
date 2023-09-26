<?php
/**
 * Created by PhpStorm.
 * User: gustavs
 * Date: 30/08/2017
 * Time: 17:29.
 */

namespace Solspace\Freeform\Services\Integrations;

use craft\db\Query;
use Solspace\Freeform\Bundles\Attributes\Property\PropertyProvider;
use Solspace\Freeform\Bundles\Integrations\Providers\FormIntegrationsProvider;
use Solspace\Freeform\Bundles\Integrations\Providers\IntegrationClientProvider;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationNotFoundException;
use Solspace\Freeform\Library\Integrations\IntegrationInterface;
use Solspace\Freeform\Models\IntegrationModel;
use Solspace\Freeform\Records\IntegrationRecord;
use Solspace\Freeform\Services\BaseService;

abstract class AbstractIntegrationService extends BaseService
{
    public function __construct(
        $config = [],
        protected FormIntegrationsProvider $formIntegrationsProvider,
        protected IntegrationClientProvider $clientProvider,
        protected PropertyProvider $propertyProvider,
    ) {
        parent::__construct($config);
    }

    public function getAllServiceProviders(): array
    {
        static $providers;

        if (null === $providers) {
            $types = $this->getIntegrationsService()->getAllIntegrationTypes();

            $providers = [];
            foreach ($types as $type) {
                if (!$type->implements($this->getIntegrationInterface())) {
                    continue;
                }

                $type->properties = $this->propertyProvider->getEditableProperties($type->class);

                $providers[$type->class] = $type;
            }
        }

        return $providers;
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

    public function getIntegrationObjectById(int $id): IntegrationInterface
    {
        $model = $this->getIntegrationById($id);

        if ($model) {
            return $model->getIntegrationObject();
        }

        throw new IntegrationException(
            Freeform::t('Integration with ID {id} not found', ['id' => $id])
        );
    }

    public function getIntegrationById(int $id): ?IntegrationModel
    {
        $data = $this->getQuery()->andWhere(['id' => $id])->one();

        if ($data) {
            return $this->createIntegrationModel($data);
        }

        return null;
    }

    public function getIntegrationByHandle(string $handle = null): ?IntegrationModel
    {
        $data = $this->getQuery()->andWhere(['handle' => $handle])->one();

        if ($data) {
            return $this->createIntegrationModel($data);
        }

        return null;
    }

    abstract protected function getIntegrationType(): string;

    abstract protected function getIntegrationInterface(): string;

    protected function getQuery(): Query
    {
        return (new Query())
            ->select(
                [
                    'integration.id',
                    'integration.enabled',
                    'integration.name',
                    'integration.handle',
                    'integration.type',
                    'integration.class',
                    'integration.metadata',
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
