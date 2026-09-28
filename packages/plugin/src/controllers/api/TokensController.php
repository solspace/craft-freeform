<?php

namespace Solspace\Freeform\controllers\api;

use Solspace\Freeform\controllers\BaseApiController;
use Solspace\Freeform\Events\Controllers\ConfigureCORSEvent;
use Solspace\Freeform\Services\Headless\HeadlessAccessService;
use yii\base\Event;
use yii\filters\Cors;

/**
 * CSRF token endpoint used by Freeform JS and headless clients.
 *
 * Applies the same headless CORS policy as BaseHeadlessController so
 * cross-origin demos (e.g. Vercel → Craft) can fetch tokens with credentials.
 */
class TokensController extends BaseApiController
{
    public const EVENT_CONFIGURE_CORS = 'configure-tokens-cors';

    public $enableCsrfValidation = false;
    protected array|bool|int $allowAnonymous = true;

    public function behaviors(): array
    {
        $behaviors = parent::behaviors();
        $origins = \Craft::$container->get(HeadlessAccessService::class)->resolveCorsOrigins();

        $corsHeaders = [
            'Access-Control-Request-Method' => ['GET', 'OPTIONS'],
            'Access-Control-Request-Headers' => [
                'Authorization',
                'Cache-Control',
                'Content-Type',
                'X-CSRF-Token',
                'X-Requested-With',
            ],
            'Access-Control-Allow-Credentials' => !\in_array('*', $origins, true),
            'Access-Control-Max-Age' => 600,
            'Origin' => $origins,
        ];

        $event = new ConfigureCORSEvent($corsHeaders);
        Event::trigger(static::class, self::EVENT_CONFIGURE_CORS, $event);

        $behaviors['corsFilter'] = [
            'class' => Cors::class,
            'cors' => $event->getHeaders(),
        ];

        return $behaviors;
    }

    protected function get(): array|object
    {
        $response = new \stdClass();

        $isCsrfEnabled = \Craft::$app->getRequest()->enableCsrfValidation;
        if (!$isCsrfEnabled) {
            return $response;
        }

        $name = \Craft::$app->config->general->csrfTokenName;
        $value = \Craft::$app->request->csrfToken;
        if (null !== $name && null !== $value) {
            $response->csrf = [
                'name' => $name,
                'value' => $value,
            ];
        }

        return $response;
    }
}
