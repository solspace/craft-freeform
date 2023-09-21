<?php

namespace Solspace\Freeform\Bundles\GraphQL\Types;

use GraphQL\Type\Definition\ResolveInfo;
use GraphQL\Type\Definition\Type;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\AttributesInterface;
use Solspace\Freeform\Library\Attributes\Attributes;

class AttributesType extends AbstractObjectType
{
    public static function getName(): string
    {
        return 'FreeformAttributesType';
    }

    public static function getTypeDefinition(): Type
    {
        return AttributesInterface::getType();
    }

    protected function resolve($source, $arguments, mixed $context, ResolveInfo $resolveInfo): ?array
    {
        if ('input' === $resolveInfo->fieldName) {
            return $this->transform($source->getInput());
        }

        if ('label' === $resolveInfo->fieldName) {
            return $this->transform($source->getLabel());
        }

        if ('error' === $resolveInfo->fieldName) {
            return $this->transform($source->getError());
        }

        if ('instructions' === $resolveInfo->fieldName) {
            return $this->transform($source->getInstructions());
        }

        if ('container' === $resolveInfo->fieldName) {
            return $this->transform($source->getContainer());
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
