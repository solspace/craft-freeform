<?php

namespace Solspace\Freeform\controllers\api;

use GuzzleHttp\Exception\BadResponseException;
use Solspace\Freeform\Bundles\Integrations\Providers\IntegrationClientProvider;
use Solspace\Freeform\Bundles\Integrations\Providers\IntegrationDTOProvider;
use Solspace\Freeform\controllers\BaseApiController;
use Solspace\Freeform\Events\Integrations\FailedRequestEvent;
use Solspace\Freeform\Library\Integrations\APIIntegration;
use Solspace\Freeform\Library\Integrations\IntegrationInterface;
use yii\base\Event;
use yii\web\NotFoundHttpException;
use yii\web\Response;

class IntegrationsController extends BaseApiController
{
    public function __construct(
        $id,
        $module,
        $config,
        private IntegrationDTOProvider $integrationDTOProvider,
        private IntegrationClientProvider $clientProvider,
    ) {
        parent::__construct($id, $module, $config);
    }

    public function actionStatusCheck(int $id): Response
    {
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

    protected function get(): array
    {
        return $this->integrationDTOProvider->getByCategory();
    }

    protected function getOne(int|string $id): null|array|object
    {
        return $this->integrationDTOProvider->getById($id);
    }
}
