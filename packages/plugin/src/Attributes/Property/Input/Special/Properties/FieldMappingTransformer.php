<?php

namespace Solspace\Freeform\Attributes\Property\Input\Special\Properties;

use Solspace\Freeform\Attributes\Property\Implementations\FieldMapping\FieldMapping;
use Solspace\Freeform\Attributes\Property\TransformerInterface;

class FieldMappingTransformer implements TransformerInterface
{
    public function transform($value): FieldMapping
    {
        $mapping = new FieldMapping();

        if (\is_array($value)) {
            foreach ($value as $source => $target) {
                if (empty($target)) {
                    continue;
                }

                $mapping->add($source, $target['type'], $target['value']);
            }
        }

        return $mapping;
    }

    public function reverseTransform($value): object
    {
        if ($value instanceof FieldMapping) {
            return $value->normalize();
        }

        return new \stdClass();
    }
}
