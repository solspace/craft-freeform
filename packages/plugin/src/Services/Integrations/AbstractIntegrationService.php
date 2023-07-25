<?php
/**
 * Created by PhpStorm.
 * User: gustavs
 * Date: 30/08/2017
 * Time: 17:29.
 */

namespace Solspace\Freeform\Services\Integrations;

use craft\db\Query;
use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Bundles\Integrations\Providers\FormIntegrationsProvider;
use Solspace\Freeform\Events\Integrations\FetchIntegrationTypesEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationNotFoundException;
use Solspace\Freeform\Library\Integrations\IntegrationInterface;
use Solspace\Freeform\Models\IntegrationModel;
use Solspace\Freeform\Records\IntegrationRecord;
use Solspace\Freeform\Services\BaseService;

abstract class AbstractIntegrationService extends BaseService
{
    public const EVENT_FETCH_TYPES = 'fetchTypes';
    public const EVENT_BEFORE_PUSH = 'beforePush';
    public const EVENT_AFTER_PUSH = 'afterPush';
    public const EVENT_AFTER_RESPONSE = 'afterResponse';

    private static ?array $integrations = null;

    public function __construct($config = [], private FormIntegrationsProvider $formIntegrationsProvider)
    {
        parent::__construct($config);
    }

    abstract public function getFetchEvent(): FetchIntegrationTypesEvent;

    /**
     * @return IntegrationInterface[]
     */
    public function getFormIntegrations(Form $form): array
    {
        return $this->formIntegrationsProvider->getForForm($form, $this->getIntegrationType());
    }

    public function getAllServiceProviders(): array
    {
        if (null === self::$integrations) {
            $event = $this->getFetchEvent();

            $this->trigger(self::EVENT_FETCH_TYPES, $event);
            $types = $event->getTypes();
            usort($types, fn (Type $a, Type $b) => strcmp($a->name, $b->name));

            $integrations = [];
            foreach ($types as $type) {
                $integrations[$type->class] = $type;
            }

            self::$integrations = $integrations;
        }

        return self::$integrations;
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
     * @return IntegrationInterface[]
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
