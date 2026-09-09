<?php

namespace Solspace\Freeform\controllers\api\headless;

use Solspace\Freeform\controllers\BaseController;
use Solspace\Freeform\Events\Controllers\ConfigureCORSEvent;
use Solspace\Freeform\Services\Headless\HeadlessAccessService;
use Solspace\Freeform\Services\Headless\HeadlessResponseHelper;
use Solspace\Freeform\Services\Headless\HeadlessSubmitService;
use Solspace\Freeform\Services\Headless\ManifestService;
use yii\base\Event;
use yii\filters\Cors;
use yii\web\Response;

abstract class BaseHeadlessController extends BaseController
{
    public const EVENT_CONFIGURE_CORS = 'configure-headless-cors';

    public $enableCsrfValidation = false;
    protected array|bool|int $allowAnonymous = true;

    public function behaviors(): array
    {
        $route = $this->resolveHeadlessRouteContext();
        $origins = $this->getHeadlessAccessService()->resolveCorsOrigins(
            $route['formHandle'],
            $route['profileName'],
        );

        $corsHeaders = [
            'Access-Control-Request-Method' => ['GET', 'POST', 'OPTIONS'],
            'Access-Control-Request-Headers' => [
                'Authorization',
                'Cache-Control',
                'Content-Type',
                'X-CSRF-Token',
                'X-Freeform-Context',
                'X-Freeform-Upload-Token',
                'Idempotency-Key',
            ],
            'Access-Control-Allow-Credentials' => !\in_array('*', $origins, true),
            'Access-Control-Max-Age' => 600,
            'Origin' => $origins,
        ];

        $event = new ConfigureCORSEvent($corsHeaders);
        Event::trigger(static::class, self::EVENT_CONFIGURE_CORS, $event);

        return [
            'corsFilter' => [
                'class' => Cors::class,
                'cors' => $event->getHeaders(),
            ],
        ];
    }

    /**
     * @param array<string, mixed> $payload
     */
    protected function asHeadlessJson(array $payload, ?int $statusCode = null): Response
    {
        if (isset($payload['success']) && false === $payload['success'] && null === $statusCode) {
            $statusCode = 400;
        }

        $response = $this->asJson($payload);
        if ($statusCode) {
            $response->setStatusCode($statusCode);
        }

        return $response;
    }

    protected function getHeadlessAccessService(): HeadlessAccessService
    {
        return \Craft::$container->get(HeadlessAccessService::class);
    }

    protected function getManifestService(): ManifestService
    {
        return \Craft::$container->get(ManifestService::class);
    }

    protected function getHeadlessSubmitService(): HeadlessSubmitService
    {
        return \Craft::$container->get(HeadlessSubmitService::class);
    }

    protected function getResponseHelper(): HeadlessResponseHelper
    {
        return \Craft::$container->get(HeadlessResponseHelper::class);
    }

    /**
     * @return array{formHandle: ?string, profileName: ?string}
     */
    protected function resolveHeadlessRouteContext(): array
    {
        $segments = explode('/', trim(\Craft::$app->getRequest()->getPathInfo(), '/'));

        if (($segments[1] ?? '') === 'api' && ($segments[2] ?? '') === 'forms' && isset($segments[3])) {
            return ['formHandle' => $segments[3], 'profileName' => null];
        }

        if (($segments[1] ?? '') === 'api' && ($segments[2] ?? '') === 'manifests' && isset($segments[3])) {
            return ['formHandle' => null, 'profileName' => $segments[3]];
        }

        return ['formHandle' => null, 'profileName' => null];
    }
}
