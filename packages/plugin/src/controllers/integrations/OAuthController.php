<?php

namespace Solspace\Freeform\controllers\integrations;

use craft\helpers\UrlHelper;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use Solspace\Freeform\controllers\BaseController;
use Solspace\Freeform\Events\Integrations\OAuth2\FetchTokenEvent;
use Solspace\Freeform\Events\Integrations\OAuth2\TokenPayloadEvent;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;
use Solspace\Freeform\Library\Integrations\OAuth\OAuth2ConnectorInterface;
use yii\base\Event;
use yii\web\NotFoundHttpException;
use yii\web\Response;

class OAuthController extends BaseController
{
    public function actionAuthorize(): Response
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

        if ($integrationsService->save($model, $integration)) {
            \Craft::$app->session->setNotice(Freeform::t('Integration saved'));
        } else {
            \Craft::$app->session->setError(Freeform::t('Integration not saved'));
        }

        $type = $integration->getTypeDefinition()->type;

        return $this->redirect(UrlHelper::cpUrl('freeform/settings/integrations/'.$type.'/'.$integration->getId()));
    }
}
