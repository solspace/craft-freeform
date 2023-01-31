<?php

namespace Solspace\Freeform\controllers\client\api\fields;

use Solspace\Freeform\Bundles\Fields\Types\FieldTypesProvider;
use Solspace\Freeform\controllers\BaseApiController;
use Solspace\Freeform\Library\Exceptions\Api\ApiException;
use Solspace\Freeform\Library\Exceptions\Api\ErrorCollection;
use Solspace\Freeform\Records\FavoriteFieldRecord;
use yii\web\Response;

class FavoritesController extends BaseApiController
{
    private const CATEGORY = 'favorites';

    public function __construct($id, $module, $config = [], private FieldTypesProvider $fieldTypesProvider)
    {
        parent::__construct($id, $module, $config);
    }

    public function actionSections(): Response
    {
        return $this->asJson($this->fieldTypesProvider->getSections());
    }

    protected function post(int|string $id = null): array|object|null
    {
        $request = $this->request;

        $type = $request->post('typeClass');
        $properties = $request->post('properties');
        $label = $request->post('label');

        $errors = [];

        if (!$type) {
            $errors[] = 'Could not determine field type';
        }

        if (!$properties) {
            $errors[] = 'No properties defined';
        }

        if (!$label) {
            $errors[] = 'Label cannot be empty';
        }

        $record = new FavoriteFieldRecord();

        if (!$errors) {
            $record->userId = \Craft::$app->user->getId() ?: null;
            $record->label = $label;
            $record->type = $type;
            $record->metadata = $properties;
            $record->save();
        }

        if ($record->hasErrors()) {
            $errors = $record->getErrorSummary(true);
        }

        if (\count($errors)) {
            throw new ApiException(
                405,
                (new ErrorCollection())->add(self::CATEGORY, 'name', $errors)
            );
        }

        $this->response->statusCode = 201;

        return null;
    }

    protected function get(): array
    {
        return $this->fieldTypesProvider->getTypes();
    }
}
