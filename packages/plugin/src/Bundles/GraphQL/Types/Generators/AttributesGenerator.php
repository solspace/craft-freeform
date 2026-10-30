<?php

namespace Solspace\Freeform\Bundles\GraphQL\Types\Generators;

use craft\gql\GqlEntityRegistry;
use craft\helpers\StringHelper;
use GraphQL\Type\Definition\Type;
use Solspace\Freeform\Attributes\Property\Input\Attributes;
use Solspace\Freeform\Bundles\GraphQL\Arguments\AttributesArguments;
use Solspace\Freeform\Bundles\GraphQL\FieldTypeMetadata;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\AttributeInterface;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\AttributesInterface;
use Solspace\Freeform\Bundles\GraphQL\Types\AttributesType;

class AttributesGenerator extends AbstractGenerator
{
    public static function getTypeClass(): string
    {
        return AttributesType::class;
    }

    public static function getArgumentsClass(): string
    {
        return AttributesArguments::class;
    }

    public static function getInterfaceClass(): string
    {
        return AttributesInterface::class;
    }

    public static function getDescription(): string
    {
        return 'The Freeform Attributes types per field type';
    }

    /**
     * Ensure an attributes type exists for the given Freeform field type shorthand.
     * E.g.: "opinion-scale" returns FreeformAttributesType_OpinionScale.
     */
    public static function getAttributesForFieldType(string $fieldTypeShorthand): Type
    {
        $typeName = self::getTypeName($fieldTypeShorthand);

        if ($existing = GqlEntityRegistry::getEntity($typeName)) {
            return $existing;
        }

        $fields = [];

        // Default groups that most fields have
        $defaultHandles = ['container', 'input', 'label', 'instructions', 'error'];

        // Determine handles for this field type
        $handles = self::detectHandlesForFieldType($fieldTypeShorthand);
        $handles = array_values(array_unique(array_merge($defaultHandles, $handles)));

        foreach ($handles as $handle) {
            $fields[$handle] = [
                'name' => $handle,
                'type' => Type::listOf(AttributeInterface::getType()),
                'description' => "Attributes for {$handle}",
            ];
        }

        return GqlEntityRegistry::createEntity($typeName, new (self::getTypeClass())([
            'name' => $typeName,
            'fields' => static fn () => $fields,
            'interfaces' => [AttributesInterface::getType()],
            'description' => 'Attributes groups available for '.$fieldTypeShorthand,
        ]));
    }

    public static function getTypeName(string $fieldTypeShorthand): string
    {
        return 'FreeformAttributesType_'.StringHelper::toPascalCase($fieldTypeShorthand);
    }

    private static function detectHandlesForFieldType(string $fieldTypeShorthand): array
    {
        try {
            $class = FieldTypeMetadata::getClasses()[$fieldTypeShorthand] ?? null;
            if (!$class) {
                return [];
            }

            $reflection = new \ReflectionClass($class);
            if (!$reflection->hasProperty('attributes')) {
                return [];
            }

            $attributes = $reflection->getProperty('attributes')->getAttributes(Attributes::class);
            if (!$attributes) {
                return [];
            }

            /** @var Attributes $metadata */
            $metadata = $attributes[0]->newInstance();

            return array_values(array_filter(array_map(
                static fn ($tab) => $tab['handle'] ?? null,
                $metadata->tabs ?? [],
            )));
        } catch (\Throwable) {
            return [];
        }
    }
}
