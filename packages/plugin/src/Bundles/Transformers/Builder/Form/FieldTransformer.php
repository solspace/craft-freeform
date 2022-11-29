<?php

namespace Solspace\Freeform\Bundles\Transformers\Builder\Form;

use Solspace\Freeform\Bundles\Fields\AttributeProvider;
use Solspace\Freeform\Library\Composer\Components\FieldInterface;
use Symfony\Component\PropertyAccess\PropertyAccessor;

class FieldTransformer
{
    public function __construct(
        private AttributeProvider $attributeProvider,
        private PropertyAccessor $propertyAccess
    ) {
    }

    public function transform(FieldInterface $field)
    {
        $typeClass = \get_class($field);
        $editableProperties = $this->attributeProvider->getEditableProperties($typeClass);

        $properties = [];
        foreach ($editableProperties as $property) {
            $properties[$property->handle] = $this->propertyAccess->getValue($field, $property->handle);
        }

        return (object) [
            'uid' => $field->getUid(),
            'typeClass' => $typeClass,
            'properties' => $properties,
        ];
    }
}
