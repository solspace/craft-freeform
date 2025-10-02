<?php

namespace Solspace\Freeform\Bundles\GraphQL\Types;

use craft\helpers\StringHelper;
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
        // Include default field attributes

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

        // Include any field specific attributes
        $method = 'get'.StringHelper::toPascalCase($resolveInfo->fieldName);

        if (method_exists($source, $method)) {
            $attributes = $source->{$method}();
            if ($attributes instanceof Attributes) {
                return $this->transform($attributes);
            }
        }

        // If implementations use array
        if (method_exists($source, 'toArray')) {
            $all = $source->toArray();

            if (isset($all[$resolveInfo->fieldName]) && $all[$resolveInfo->fieldName] instanceof Attributes) {
                return $this->transform($all[$resolveInfo->fieldName]);
            }
        }

        return null;
    }

    private function transform(Attributes $fieldAttributes): array
    {
        // System specific attributes Freeform adds for identification
        static $excludeExact = [
            'data-field-container',
            'data-field-type',
            'data-field-handle',
            'data-field-id',
        ];

        $attributes = [];

        foreach ($fieldAttributes->toArray() as $attribute => $value) {
            // Exclude only known system keys; keep everything else (including user data-* keys)
            if (\in_array($attribute, $excludeExact, true)) {
                continue;
            }

            $attributes[] = [
                'value' => $value,
                'attribute' => $attribute,
            ];
        }

        return $attributes;
    }
}
