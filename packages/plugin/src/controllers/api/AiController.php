<?php

namespace Solspace\Freeform\controllers\api;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use Solspace\Freeform\controllers\BaseApiController;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Integrations\AI\SolspaceAI\BaseSolspaceAIIntegration;
use Solspace\Freeform\Library\Helpers\PermissionHelper;
use yii\web\NotFoundHttpException;
use yii\web\Response;

class AiController extends BaseApiController
{
    public function actionSolspaceAiStatus(): Response
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_INTEGRATIONS_ACCESS);

        $model = Freeform::getInstance()->integrations->getFirstEnabledSolspaceAIIntegration();
        $enabled = null !== $model;
        $url = '/integrations/ai/SolspaceAIV1';
        if ($model) {
            $url .= '/'.$model->id;
        }

        return $this->asJson([
            'enabled' => $enabled,
            'url' => $url,
        ]);
    }

    public function actionUsage(): Response
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_INTEGRATIONS_ACCESS);

        $integration = $this->getSolspaceAIIntegration();
        if (!$integration) {
            throw new NotFoundHttpException('Solspace AI is not enabled.');
        }

        $licenseKey = $this->getLicenseKey();
        if ('' === $licenseKey) {
            $this->response->statusCode = 400;

            return $this->asJson([
                'error' => 'License key is not configured.',
            ]);
        }

        $baseUrl = rtrim($integration->getApiBaseUrl(), '/');
        $url = $baseUrl.'/freeform/usage?user_id='.rawurlencode($licenseKey);

        return $this->fetchSolspaceAiUsage($url);
    }

    public function actionSpendReport(?string $start_date = null, ?string $end_date = null): Response
    {
        return $this->actionUsage();
    }

    private function getSolspaceAIIntegration(): ?BaseSolspaceAIIntegration
    {
        $model = Freeform::getInstance()->integrations->getFirstEnabledSolspaceAIIntegration();
        if (!$model) {
            return null;
        }

        $integration = $model->getIntegrationObject();
        if (!$integration instanceof BaseSolspaceAIIntegration) {
            return null;
        }

        return $integration;
    }

    private function getLicenseKey(): string
    {
        $plugin = \Craft::$app->plugins->getPlugin('freeform');
        if (!$plugin) {
            return '';
        }

        return (string) \Craft::$app->plugins->getPluginLicenseKey($plugin->id);
    }

    private function fetchSolspaceAiUsage(string $url): Response
    {
        try {
            $client = new Client(['timeout' => 15]);
            $response = $client->get($url, [
                'headers' => ['Accept' => 'application/json'],
                'http_errors' => false,
            ]);
        } catch (GuzzleException $e) {
            $this->response->statusCode = 502;

            return $this->asJson([
                'error' => 'Failed to reach Solspace AI usage service',
                'message' => $e->getMessage(),
            ]);
        }

        $statusCode = $response->getStatusCode();
        $body = (string) $response->getBody();

        $this->response->statusCode = $statusCode;
        $this->response->format = Response::FORMAT_RAW;
        $this->response->content = $body;
        $this->response->headers->set('Content-Type', 'application/json');

        return $this->response;
    }
}
