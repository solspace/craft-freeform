<?php

namespace Solspace\Freeform\Attributes\Property\Transformers;

use Solspace\Freeform\Attributes\Property\TransformerInterface;
use Solspace\Freeform\Library\Attributes\FieldAttributesCollection;

class AttributesTransformer implements TransformerInterface
{
    public const DEFAULT_VALUE = [
        'container' => [],
        'input' => [],
        'label' => [],
        'instructions' => [],
        'error' => [],
    ];

    public function transform($value): FieldAttributesCollection
    {
        $collection = new FieldAttributesCollection();

        if (empty($value)) {
            return $collection;
        }

        $collection->getContainer()->setBatch($value['container'] ?? []);
        $collection->getInput()->setBatch($value['input'] ?? []);
        $collection->getLabel()->setBatch($value['label'] ?? []);
        $collection->getInstructions()->setBatch($value['instructions'] ?? []);
        $collection->getError()->setBatch($value['error'] ?? []);

        return $collection;
    }

    public function reverseTransform($value): array
    {
        if ($value instanceof FieldAttributesCollection) {
            return [
                'container' => $value->getContainer(),
                'input' => $value->getInput(),
                'label' => $value->getLabel(),
                'instructions' => $value->getInstructions(),
                'error' => $value->getError(),
            ];
        }

        return self::DEFAULT_VALUE;
    }
}
