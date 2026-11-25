<?php

namespace Solspace\Freeform\controllers\api;

use Solspace\Freeform\controllers\BaseCpApiController;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Helpers\BooleanHelper;
use Solspace\Freeform\Library\Helpers\PermissionHelper;
use yii\web\Response;

class AutosuggestController extends BaseCpApiController
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

        $suggestions = $cp->getEnvSuggestions();
        if (!PermissionHelper::isAdmin()) {
            foreach ($suggestions as &$category) {
                $category['data'] = array_map(
                    static fn (array $item): array => ['name' => $item['name']],
                    $category['data'],
                );
            }
            unset($category);
        }

        return $this->asJson($suggestions);
    }
}
