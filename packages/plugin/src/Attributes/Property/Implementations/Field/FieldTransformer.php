<?php

namespace Solspace\Freeform\Attributes\Property\Implementations\Field;

use Solspace\Freeform\Attributes\Property\TransformerInterface;
use Solspace\Freeform\Bundles\Fields\FieldProvider;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Form\Form;

class FieldTransformer implements TransformerInterface
{
    public function __construct(private FieldProvider $fieldProvider) {}

    public function transform($value, ?Form $form = null): ?FieldInterface
    {
        if (null === $value) {
            return null;
        }

        return $this->fieldProvider->getFieldByUid($value, $form);
    }

    public function reverseTransform($value): ?string
    {
        if ($value instanceof FieldInterface) {
            return $value->getUid();
        }

        return null;
    }
}
