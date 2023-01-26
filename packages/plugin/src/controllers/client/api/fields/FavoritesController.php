<?php

namespace Solspace\Freeform\controllers\client\api\fields;

use Solspace\Freeform\Bundles\Fields\Types\FieldTypesProvider;
use Solspace\Freeform\controllers\BaseApiController;
use yii\web\Response;

class FavoritesController extends BaseApiController
{
    public function __construct($id, $module, $config = [], private FieldTypesProvider $fieldTypesProvider)
    {
        parent::__construct($id, $module, $config);
    }

    public function actionSections(): Response
    {
        return $this->asJson($this->fieldTypesProvider->getSections());
    }

    protected function post(int|string $id = null): array|object
    {
        return ['posted' => $this->request->post()];
        $this->response->statusCode = 405;

        return ['errors' => ['favorites' => ['name' => ['test error', 'other test error']]]];
    }

    protected function get(): array
    {
        return $this->fieldTypesProvider->getTypes();
    }
}
