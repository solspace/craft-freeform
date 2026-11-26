<?php

namespace Solspace\Freeform\Bundles\Persistence;

use Solspace\Freeform\Bundles\Attributes\Property\PropertyProvider;
use Solspace\Freeform\Events\Forms\PersistFormEvent;

final class FieldMetadata
{
    public static function validate(PropertyProvider $propertyProvider, \stdClass $fieldData, PersistFormEvent $event): array
    {
        $properties = $propertyProvider->getEditableProperties($fieldData->typeClass);

        $metadata = [];
        foreach ($properties as $property) {
            $handle = $property->handle;
            $value = $fieldData->properties->{$handle} ?? null;

            $errors = [];
            foreach ($property->validators as $validator) {
                $errors = array_merge($errors, $validator->validate($value));
            }

            if ($errors) {
                $event->addErrorsToResponse(
                    'fields',
                    [$fieldData->uid => [$property->handle => $errors]]
                );
            }

            $metadata[$handle] = $value;
        }

        return $metadata;
    }
}
