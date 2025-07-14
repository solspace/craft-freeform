<?php

namespace Solspace\Freeform\Bundles\Integrations\OAuth\Controllers;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use JetBrains\PhpStorm\NoReturn;
use Solspace\Freeform\controllers\BaseController;
use Solspace\Freeform\Events\Integrations\OAuth2\FetchTokenEvent;
use Solspace\Freeform\Events\Integrations\OAuth2\InitiateAuthenticationFlowEvent;
use Solspace\Freeform\Events\Integrations\OAuth2\TokenPayloadEvent;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;
use Solspace\Freeform\Library\Integrations\OAuth\OAuth2ConnectorInterface;
use yii\base\Event;
use yii\web\NotFoundHttpException;
use yii\web\Response;

class OAuth2AuthController extends BaseController
{
    protected array|bool|int $allowAnonymous = ['callback'];

    #[NoReturn]
    public function actionAuthorize(int $id): void
    {
        $integration = $this->getIntegrationsService()->getIntegrationObjectById($id);
        if (!$integration instanceof OAuth2ConnectorInterface) {
            throw new NotFoundHttpException('No authorization flow available');
        }

        $payload = [
            'response_type' => 'code',
            'client_id' => $integration->getClientId(),
            'redirect_uri' => $integration->getRedirectUri(),
            'state' => $integration->getId(),
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
        $this->initAccessTokenFlow();

        return $this->closeWindowResponse();
    }

    /**
     * @deprecated will be removed in Freeform 6.0
     */
    public function actionFirewallCallback(): Response
    {
        $this->initAccessTokenFlow();

        return $this->closeWindowResponse();
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

    private function initAccessTokenFlow(): void
    {
        $integrationsService = $this->getIntegrationsService();

        $code = $this->request->get('code');
        if (!$code) {
            throw new NotFoundHttpException('Code not present');
        }

        $integrationId = (int) $this->request->get('state', 0);
        $model = $integrationsService->getById($integrationId);
        if (!$model) {
            throw new NotFoundHttpException('Integration not found');
        }

        $integration = $model->getIntegrationObject();
        if (!$integration instanceof OAuth2ConnectorInterface) {
            throw new NotFoundHttpException('Integration does not implement authorizable interface');
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
        } catch (RequestException $e) {
            throw new IntegrationException((string) $e->getResponse()->getBody());
        }

        $responsePayload = json_decode((string) $response->getBody());

        Event::trigger(
            OAuth2ConnectorInterface::class,
            OAuth2ConnectorInterface::EVENT_AFTER_AUTHORIZE,
            new TokenPayloadEvent($integration, $responsePayload)
        );

        $model->connectionEstablished = true;

        $integrationsService->save($model, $integration);
    }
}
