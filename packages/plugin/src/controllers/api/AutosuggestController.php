<?php

namespace Solspace\Freeform\controllers\api;

use Solspace\Freeform\controllers\BaseApiController;
use yii\web\Response;

class AutosuggestController extends BaseApiController
{
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
