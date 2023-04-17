<?php

namespace Solspace\Freeform\Form\Properties\GTM;

use Solspace\Freeform\Attributes\Property\Transformer;

class GTMValueTransformer extends Transformer
{
    public function transform($value): GTMProperty
    {
        return new GTMProperty($value);
    }

    /**
     * @param GTMProperty $value
     */
    public function reverseTransform($value): \stdClass
    {
        return (object) [
            'enabled' => $value->isEnabled() ?? false,
            'id' => $value->getId() ?? null,
            'event' => $value->getEvent() ?? null,
        ];
    }
}
