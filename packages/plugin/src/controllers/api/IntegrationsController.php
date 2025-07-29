<?php

namespace Solspace\Freeform\controllers\api;

use GuzzleHttp\Exception\BadResponseException;
use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Bundles\Attributes\Property\PropertyProvider;
use Solspace\Freeform\Bundles\Fields\ImplementationProvider;
use Solspace\Freeform\Bundles\Integrations\Providers\IntegrationClientProvider;
use Solspace\Freeform\Bundles\Integrations\Providers\IntegrationDTOProvider;
use Solspace\Freeform\Bundles\Integrations\Providers\IntegrationTypeProvider;
use Solspace\Freeform\controllers\BaseApiController;
use Solspace\Freeform\Events\Integrations\FailedRequestEvent;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Exceptions\Api\ApiException;
use Solspace\Freeform\Library\Exceptions\Api\FlatErrorCollection;
use Solspace\Freeform\Library\Helpers\PermissionHelper;
use Solspace\Freeform\Library\Helpers\StringHelper;
use Solspace\Freeform\Library\Integrations\APIIntegration;
use Solspace\Freeform\Library\Integrations\IntegrationInterface;
use Solspace\Freeform\Models\IntegrationModel;
use yii\base\Event;
use yii\web\NotFoundHttpException;
use yii\web\Response;

class IntegrationsController extends BaseApiController
{
    private const NAVIGATION_ORDER = [
        'single' => 0,
        'email-marketing' => 10,
        'crm' => 20,
        'elements' => 30,
        'captchas' => 40,
        'spam-blocking' => 50,
        'payment-gateways' => 60,
        'webhooks' => 70,
        'other' => 80,
    ];

    public function __construct(
        $id,
        $module,
        $config,
        private IntegrationDTOProvider $integrationDTOProvider,
        private IntegrationClientProvider $clientProvider,
        private IntegrationTypeProvider $typeProvider,
        private PropertyProvider $propertyProvider,
        private ImplementationProvider $implementationProvider,
    ) {
        parent::__construct($id, $module, $config);
    }

    public function actionProperties(?string $id = null, ?string $type = null, ?string $integration = null): Response
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_INTEGRATIONS_ACCESS);

        if ($id) {
            $model = $this->getIntegrationsService()->getIntegrationObjectById($id);

            $properties = $this->propertyProvider->getEditableProperties($model);
            $properties->removeFlagged(
                IntegrationInterface::FLAG_INSTANCE_ONLY,
                IntegrationInterface::FLAG_INTERNAL,
            );

            return $this->asSerializedJson([
                'id' => $model->getId(),
                'uid' => $model->getUid(),
                'name' => $model->getName(),
                'handle' => $model->getHandle(),
                'enabled' => $model->isEnabled(),
                'type' => $model->getTypeDefinition(),
                'implements' => $this->implementationProvider->getImplementations($model::class),
                'properties' => $properties,
            ]);
        }

        $allTypes = $this->typeProvider->getAllTypeDefinitions();

        /** @var Type $typeDefinition */
        $typeDefinition = null;
        foreach ($allTypes as $definition) {
            if ($definition->shortName === $integration && $definition->type === $type) {
                $typeDefinition = $definition;

                break;
            }
        }

        if (!$typeDefinition) {
            throw new NotFoundHttpException('Integration type not found');
        }

        $properties = $this->propertyProvider->getEditableProperties($typeDefinition->class);
        $properties->removeFlagged(
            IntegrationInterface::FLAG_INSTANCE_ONLY,
            IntegrationInterface::FLAG_INTERNAL,
        );

        return $this->asSerializedJson([
            'id' => null,
            'name' => $typeDefinition->name,
            'handle' => StringHelper::toHandle($typeDefinition->name),
            'enabled' => true,
            'type' => $typeDefinition,
            'implements' => $this->implementationProvider->getImplementations($typeDefinition->class),
            'properties' => $properties,
        ]);
    }

    public function actionNavigation(): Response
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_INTEGRATIONS_ACCESS);

        $types = $this->typeProvider->getAllTypeDefinitions(false);
        $integrations = $this->getIntegrationsService()->getAllIntegrations();

        $sections = [];

        foreach ($types as $type) {
            if (!$type->class::isInstallable()) {
                continue;
            }

            if (!\array_key_exists($type->type, $sections)) {
                $sections[$type->type] = [];
            }

            $data = [
                'type' => $type,
                'instances' => array_values(
                    array_map(
                        fn ($integration) => [
                            'id' => $integration->id,
                            'uid' => $integration->uid,
                            'name' => $integration->name,
                            'handle' => $integration->handle,
                        ],
                        array_filter(
                            $integrations,
                            fn ($integration) => $integration->class === $type->class
                        ),
                    )
                ),
            ];

            $sections[$type->type][] = $data;
        }

        $categorized = [];
        foreach ($sections as $type => $items) {
            $categorized[] = [
                'title' => $this->typeProvider->getTypeTitle($type),
                'handle' => $type,
                'entries' => $items,
            ];
        }

        usort($categorized, function ($a, $b) {
            $aOrder = self::NAVIGATION_ORDER[$a['handle']] ?? 100;
            $bOrder = self::NAVIGATION_ORDER[$b['handle']] ?? 100;

            return $aOrder <=> $bOrder;
        });

        return $this->asSerializedJson($categorized);
    }

    public function actionStatusCheck(int $id): Response
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_INTEGRATIONS_ACCESS);

        $integration = $this->getIntegrationsService()->getById($id);
        if (!$integration) {
            throw new NotFoundHttpException('Integration not found');
        }

        $integrationObject = $integration->getIntegrationObject();
        if (!$integrationObject instanceof APIIntegration) {
            throw new NotFoundHttpException('Integration not found');
        }

        if (!$integration->connectionEstablished) {
            return $this->asJson([
                'status' => 'unauthorized',
                'errors' => null,
            ]);
        }

        $response = [
            'status' => 'pending',
            'errors' => null,
        ];

        $client = null;

        try {
            $client = $this->clientProvider->getAuthorizedClient($integrationObject);
        } catch (\Exception $exception) {
            $response['status'] = 'error';
            $response['errors'] = [$exception->getMessage()];
        }

        if (!$client) {
            return $this->asJson($response);
        }

        try {
            if ($integrationObject->checkConnection($client)) {
                $response['status'] = 'authorized';
            } else {
                $response['status'] = 'unauthorized';
            }
        } catch (\Exception $exception) {
            $event = new FailedRequestEvent(null, $integrationObject, $exception);
            Event::trigger(
                IntegrationInterface::class,
                IntegrationInterface::EVENT_ON_FAILED_REQUEST,
                $event,
            );

            if ($event->isRetry()) {
                $client = $this->clientProvider->getAuthorizedClient($integrationObject);

                try {
                    if ($integrationObject->checkConnection($client)) {
                        $response['status'] = 'authorized';
                    } else {
                        $response['status'] = 'unauthorized';
                    }

                    return $this->asJson($response);
                } catch (\Exception $exception) {
                }
            }

            $message = $exception->getMessage();
            if ($exception instanceof BadResponseException) {
                $responseBody = (string) $exception->getResponse()->getBody();
                if ($responseBody) {
                    $message = $responseBody;
                }
            }

            $response['status'] = 'error';
            $response['errors'] = [$message];
        }

        return $this->asJson($response);
    }

    public function actionDelete(int $id): Response
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_INTEGRATIONS_MANAGE);

        $this->getIntegrationsService()->delete($id);

        return $this->asEmptyResponse(204);
    }

    protected function post(null|int|string $id = null): null|array|object
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_INTEGRATIONS_MANAGE);

        $class = $this->request->post('class');
        $values = $this->request->post('values', []);
        $metadata = $values['metadata'] ?? [];
        unset($values['metadata']);

        $type = $this->typeProvider->getTypeDefinition($class);
        if (!$type) {
            throw new NotFoundHttpException('Integration type not found');
        }

        if ($id) {
            $model = $this->getIntegrationsService()->getById($id);
        } else {
            $model = IntegrationModel::create($type->type);
            $model->class = $class;
        }

        $model->metadata = array_merge($model->metadata ?? [], $metadata);
        $model->setAttributes($values);

        $this->getIntegrationsService()->parsePostedModelData($model, array_keys($metadata));
        $integration = $model->getIntegrationObject();

        try {
            $integration->onBeforeSave();
        } catch (\Exception $e) {
            $model->addError('integration', $e->getMessage());
        }

        if ($this->getIntegrationsService()->save($model, $integration, true)) {
            $this->response->statusCode = $id ? 200 : 201;
            if (!$id) {
                return [
                    'id' => $model->id,
                    'type' => $type->type,
                    'integration' => $type->shortName,
                ];
            }

            return null;
        }

        throw new ApiException(400, FlatErrorCollection::fromModel($model));
    }

    protected function get(): array
    {
        return $this->integrationDTOProvider->getByCategory();
    }

    protected function getOne(int|string $id): null|array|object
    {
        return $this->integrationDTOProvider->getById($id);
    }
}
