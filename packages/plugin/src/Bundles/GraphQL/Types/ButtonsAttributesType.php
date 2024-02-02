<?php

namespace Solspace\Freeform\Bundles\GraphQL\Types;

use GraphQL\Type\Definition\ResolveInfo;
use GraphQL\Type\Definition\Type;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\ButtonsAttributesInterface;
use Solspace\Freeform\Library\Attributes\Attributes;

class ButtonsAttributesType extends AbstractObjectType
{
    public static function getName(): string
    {
        return 'FreeformButtonsAttributesType';
    }

    public static function getTypeDefinition(): Type
    {
        return ButtonsAttributesInterface::getType();
    }

    protected function resolve($source, $arguments, mixed $context, ResolveInfo $resolveInfo): ?array
    {
        if ('container' === $resolveInfo->fieldName) {
            return $this->transform($source->getContainer());
        }

        if ('column' === $resolveInfo->fieldName) {
            return $this->transform($source->getColumn());
        }

        if ('buttonWrapper' === $resolveInfo->fieldName) {
            return $this->transform($source->getButtonWrapper());
        }

        if ('submit' === $resolveInfo->fieldName) {
            return $this->transform($source->getSubmit());
        }

        if ('back' === $resolveInfo->fieldName) {
            return $this->transform($source->getBack());
        }

        if ('save' === $resolveInfo->fieldName) {
            return $this->transform($source->getSave());
        }

        return null;
    }

    private function transform(Attributes $fieldAttributes): array
    {
        $attributes = [];

        foreach ($fieldAttributes->toArray() as $attribute => $value) {
            $attributes[] = [
                'value' => $value,
                'attribute' => $attribute,
            ];
        }

        return $attributes;
    }
}
