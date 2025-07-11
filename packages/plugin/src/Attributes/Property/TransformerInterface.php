<?php

namespace Solspace\Freeform\Attributes\Property;

use Solspace\Freeform\Form\Form;

interface TransformerInterface
{
    /**
     * Transform a serialized value into a field value.
     *
     * @param mixed $value
     * @param Form|null $form
     */
    public function transform($value, ?Form $form = null): mixed;

    /**
     * Transform a field value into a serialized value.
     *
     * @param mixed $value
     */
    public function reverseTransform($value): mixed;
}
