<?php

namespace Solspace\Freeform\Bundles\Integrations\OAuth\Controllers;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use Solspace\Freeform\Bundles\Integrations\OAuth\Providers\OAuth2StateProvider;
use Solspace\Freeform\Bundles\Integrations\Providers\IntegrationLoggerProvider;
use Solspace\Freeform\controllers\BaseController;
use Solspace\Freeform\controllers\PopUpTrait;
use Solspace\Freeform\Events\Integrations\OAuth2\FetchTokenEvent;
use Solspace\Freeform\Events\Integrations\OAuth2\TokenPayloadEvent;
use Solspace\Freeform\Library\Integrations\OAuth\OAuth2ConnectorInterface;
use yii\base\Event;
use yii\web\Response;

class OAuth2AuthController extends BaseController
{
    use PopUpTrait;

    protected array|bool|int $allowAnonymous = ['callback'];

    public function __construct(
        $id,
        $module,
        $config,
        private IntegrationLoggerProvider $loggerProvider,
        private OAuth2StateProvider $stateProvider,
    ) {
        parent::__construct($id, $module, $config);
    }

    public function actionCallback(): Response
    {
        $integrationsService = $this->getIntegrationsService();

        $code = $this->request->get('code');
        if (!$code) {
            return $this->renderPopUpError('Code not present');
        }

        $state = $this->request->get('state');
        if (!$state) {
            return $this->renderPopUpError('State not present');
        }

        $integrationId = $this->stateProvider->extractIntegrationIdFromState($state);
        if (!$integrationId) {
            return $this->renderPopUpError('State is invalid or expired');
        }

        $model = $integrationsService->getById($integrationId);
        if (!$model) {
            return $this->renderPopUpError('Integration not found');
        }

        $integration = $model->getIntegrationObject();
        if (!$integration instanceof OAuth2ConnectorInterface) {
            return $this->renderPopUpError('Integration does not implement OAuth2ConnectorInterface');
        }

        $client = new Client();
        $payload = [
            'grant_type' => 'authorization_code',
            'client_id' => $integration->getClientId(),
            'client_secret' => $integration->getClientSecret(),
            'redirect_uri' => $integration->getRedirectUri(),
            'code' => $code,
        ];

        $event = new FetchTokenEvent($integration, $payload);
        Event::trigger(
            OAuth2ConnectorInterface::class,
            OAuth2ConnectorInterface::EVENT_BEFORE_AUTHORIZE,
            $event
        );

        try {
            $response = $client->post(
                $integration->getAccessTokenUrl(),
                ['form_params' => $event->getPayload()]
            );
        } catch (RequestException $exception) {
            if ($exception->hasResponse()) {
                $responseBody = (string) $exception->getResponse()->getBody();
                $errorMessage = json_decode($responseBody, true)['error_description'] ?? $responseBody;
            } else {
                $errorMessage = $exception->getMessage();
            }

            $logger = $this->loggerProvider->getLogger($integration);
            $logger->error('OAuth2 authorization failed', [
                'exception' => $exception,
                'integration' => [
                    'id' => $integration->getId(),
                    'handle' => $integration->getHandle(),
                ],
            ]);

            return $this->renderPopUpError($errorMessage);
        }

        $responsePayload = json_decode((string) $response->getBody());

        Event::trigger(
            OAuth2ConnectorInterface::class,
            OAuth2ConnectorInterface::EVENT_AFTER_AUTHORIZE,
            new TokenPayloadEvent($integration, $responsePayload)
        );

        $model->connectionEstablished = true;

        $integrationsService->save($model, $integration);

        return $this->closePopUpWindowResponse();
    }
}
