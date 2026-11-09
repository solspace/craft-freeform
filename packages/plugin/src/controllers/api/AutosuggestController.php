<?php

namespace Solspace\Freeform\controllers\api;

use Solspace\Freeform\controllers\BaseApiController;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Helpers\BooleanHelper;
use Solspace\Freeform\Library\Helpers\PermissionHelper;
use yii\web\Response;

class AutosuggestController extends BaseApiController
{
    public function actionBooleanEnv(string $value): Response
    {
        $this->requireAcceptsJson();
        PermissionHelper::requirePermission(Freeform::PERMISSION_INTEGRATIONS_ACCESS);

        // Return only the normalized boolean, never the environment variable's contents.
        return $this->asJson(BooleanHelper::normalize($value));
    }

    public function actionEnv(): Response
    {
        $this->requireAcceptsJson();

        $globals = \Craft::$app->view->getTwig()->getGlobals();
        $cp = $globals['craft']->cp ?? null;
        if (!$cp || !method_exists($cp, 'getEnvSuggestions')) {
            return $this->asJson([]);
        }

        return $this->asJson($cp->getEnvSuggestions());
    }
}
