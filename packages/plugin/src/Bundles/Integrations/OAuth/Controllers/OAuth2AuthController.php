<?php

namespace Solspace\Freeform\Bundles\Integrations\OAuth\Controllers;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use JetBrains\PhpStorm\NoReturn;
use Solspace\Freeform\Bundles\Integrations\Providers\IntegrationLoggerProvider;
use Solspace\Freeform\controllers\BaseController;
use Solspace\Freeform\Events\Integrations\OAuth2\FetchTokenEvent;
use Solspace\Freeform\Events\Integrations\OAuth2\InitiateAuthenticationFlowEvent;
use Solspace\Freeform\Events\Integrations\OAuth2\TokenPayloadEvent;
use Solspace\Freeform\Library\Helpers\CryptoHelper;
use Solspace\Freeform\Library\Helpers\EncryptionHelper;
use Solspace\Freeform\Library\Integrations\OAuth\OAuth2ConnectorInterface;
use yii\base\Event;
use yii\web\NotFoundHttpException;
use yii\web\Response;

class OAuth2AuthController extends BaseController
{
    protected array|bool|int $allowAnonymous = ['callback'];

    public function __construct(
        $id,
        $module,
        $config,
        private IntegrationLoggerProvider $loggerProvider
    ) {
        parent::__construct($id, $module, $config);
    }

    #[NoReturn]
    public function actionAuthorize(int $id): void
    {
        $integration = $this->getIntegrationsService()->getIntegrationObjectById($id);
        if (!$integration instanceof OAuth2ConnectorInterface) {
            throw new NotFoundHttpException('No authorization flow available');
        }

        $token = CryptoHelper::getUniqueToken(6);

        $payload = [
            'response_type' => 'code',
            'client_id' => $integration->getClientId(),
            'redirect_uri' => $integration->getRedirectUri(),
            'state' => $this->encryptState($integration->getId(), $token),
        ];

        $event = new InitiateAuthenticationFlowEvent($integration, $payload);
        Event::trigger(
            OAuth2ConnectorInterface::class,
            OAuth2ConnectorInterface::EVENT_INITIATE_AUTHENTICATION_FLOW,
            $event
        );

        $queryString = http_build_query($event->getPayload());

        header('Location: '.$integration->getAuthorizeUrl().'?'.$queryString);

        exit;
    }

    public function actionCallback(): Response
    {
        $integrationsService = $this->getIntegrationsService();

        $code = $this->request->get('code');
        if (!$code) {
            return $this->renderError('Code not present');
        }

        $state = $this->request->get('state');
        if (!$state) {
            return $this->renderError('State not present');
        }

        $integrationId = $this->extractIntegrationIdFromState($state);
        if (!$integrationId) {
            return $this->renderError('State is invalid or expired');
        }

        $model = $integrationsService->getById($integrationId);
        if (!$model) {
            return $this->renderError('Integration not found');
        }

        $integration = $model->getIntegrationObject();
        if (!$integration instanceof OAuth2ConnectorInterface) {
            return $this->renderError('Integration does not implement OAuth2ConnectorInterface');
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

            return $this->renderError($errorMessage);
        }

        $responsePayload = json_decode((string) $response->getBody());

        Event::trigger(
            OAuth2ConnectorInterface::class,
            OAuth2ConnectorInterface::EVENT_AFTER_AUTHORIZE,
            new TokenPayloadEvent($integration, $responsePayload)
        );

        $model->connectionEstablished = true;

        $integrationsService->save($model, $integration);

        return $this->closeWindowResponse();
    }

    private function encryptState(int $integrationId, string $token): string
    {
        $cacheKey = $this->createKey($integrationId, $token);
        \Craft::$app->cache->set($cacheKey, true, 60 * 5); // Cache for 5 minutes

        $encryptionKey = EncryptionHelper::getKey();
        $data = json_encode([
            'integrationId' => $integrationId,
            'token' => $token,
        ]);

        return EncryptionHelper::encryptByKey($encryptionKey, $data);
    }

    private function extractIntegrationIdFromState(string $state): ?int
    {
        $encryptionKey = EncryptionHelper::getKey();
        $json = EncryptionHelper::decryptByKey($encryptionKey, $state);
        if (!$json) {
            return null;
        }

        $data = json_decode($json, false);
        if (\JSON_ERROR_NONE !== json_last_error()) {
            return null;
        }

        $id = $data->integrationId ?? null;
        $token = $data->token ?? null;

        $cacheKey = $this->createKey($id, $token);
        if (\Craft::$app->cache->exists($cacheKey)) {
            \Craft::$app->cache->delete($cacheKey);

            return $id;
        }

        return null;
    }

    private function closeWindowResponse(): Response
    {
        $this->response->format = Response::FORMAT_HTML;
        $this->response->statusCode = 200;
        $this->response->content = <<<'HTML'
                <script>
                  window.opener && window.opener.postMessage({ type: 'oauth2' }, window.location.origin);
                  window.close();
                </script>
            HTML;

        return $this->response;
    }

    private function createKey(int $integrationId, string $token): string
    {
        return 'oauth2_auth_flow_'.$integrationId.'_'.$token;
    }

    private function renderError(string $message): Response
    {
        return $this->renderTemplate(
            'freeform/settings/integrations/callback-error',
            ['message' => $message],
        );
    }
}
