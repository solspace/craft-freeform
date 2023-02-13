<?php

namespace Solspace\Freeform\Attributes\Property;

interface TransformerInterface
{
    /**
     * Transform a serialized value into a field value.
     *
     * @param mixed $value
     */
    public function transform($value): mixed;

    /**
     * Transform a field value into a serialized value.
     *
     * @param mixed $value
     */
    public function reverseTransform($value): mixed;
}
