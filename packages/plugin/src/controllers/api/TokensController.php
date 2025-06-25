<?php

namespace Solspace\Freeform\controllers\api;

use Solspace\Freeform\controllers\BaseApiController;

class TokensController extends BaseApiController
{
    public $enableCsrfValidation = false;
    protected array|bool|int $allowAnonymous = true;

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
