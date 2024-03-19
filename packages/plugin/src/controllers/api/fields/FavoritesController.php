<?php

namespace Solspace\Freeform\controllers\api\fields;

use craft\helpers\StringHelper;
use Solspace\Freeform\Bundles\Attributes\Property\PropertyProvider;
use Solspace\Freeform\Bundles\Fields\FavoritesProvider;
use Solspace\Freeform\controllers\BaseApiController;
use Solspace\Freeform\Library\Exceptions\Api\ApiException;
use Solspace\Freeform\Library\Exceptions\Api\ErrorCollection;
use Solspace\Freeform\Records\FavoriteFieldRecord;

class FavoritesController extends BaseApiController
{
    private const CATEGORY = 'favorites';

    public function __construct(
        $id,
        $module,
        $config,
        private FavoritesProvider $favoritesProvider,
        private PropertyProvider $propertyProvider,
    ) {
        parent::__construct($id, $module, $config);
    }

    protected function get(): array
    {
        return $this->favoritesProvider->getFavoriteFields();
    }

    protected function post(null|int|string $id = null): null|array|object
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

        $properties['label'] = $label;
        $properties['handle'] = preg_replace('/[^a-z0-9_\-]/i', '', StringHelper::camelCase($label));

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

    protected function put(null|int|string $id = null): null|array|object
    {
        $post = $this->request->post();

        $ids = array_keys($post);

        /** @var FavoriteFieldRecord[] $records */
        $records = FavoriteFieldRecord::find()
            ->where(['id' => $ids])
            ->indexBy('id')
            ->all()
        ;

        foreach ($post as $id => $values) {
            $record = $records[$id] ?? null;
            if (!$record) {
                continue;
            }

            $record->metadata = $this->getValidatedMetadata($record, $values);
            $record->label = $values['label'] ?? '';
        }

        $errors = new ErrorCollection();
        foreach ($records as $record) {
            if ($record->hasErrors()) {
                $errorList = $record->getErrors();
                foreach ($errorList as $handle => $messages) {
                    $errors->add($record->id, $handle, $messages);
                }
            }
        }

        if ($errors->hasErrors()) {
            throw new ApiException(400, $errors);
        }

        foreach ($records as $record) {
            $record->save();
        }

        return null;
    }

    protected function delete(int $id): ?bool
    {
        $record = FavoriteFieldRecord::findOne(['id' => $id]);
        if (!$record) {
            return null;
        }

        $record->delete();

        return true;
    }

    private function getValidatedMetadata(FavoriteFieldRecord $record, array $values): array
    {
        $properties = $this->propertyProvider->getEditableProperties($record->type);

        $metadata = [];
        foreach ($properties as $property) {
            $handle = $property->handle;
            $value = $values[$handle] ?? null;

            $errors = [];
            foreach ($property->validators as $validator) {
                $errors = array_merge($errors, $validator->validate($value));
            }

            if ($errors) {
                foreach ($errors as $error) {
                    $record->addError($handle, $error);
                }
            }

            $metadata[$handle] = $value;
        }

        return $metadata;
    }
}
