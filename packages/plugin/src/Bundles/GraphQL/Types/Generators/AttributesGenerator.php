<?php

namespace Solspace\Freeform\Bundles\GraphQL\Types\Generators;

use craft\gql\GqlEntityRegistry;
use craft\helpers\StringHelper;
use GraphQL\Type\Definition\Type;
use Solspace\Freeform\Attributes\Property\Input\Attributes;
use Solspace\Freeform\Bundles\Fields\Types\FieldTypesProvider;
use Solspace\Freeform\Bundles\GraphQL\Arguments\AttributesArguments;
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
            'fields' => fn () => $fields,
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
            $fieldTypeDto = null;

            /** @var FieldTypesProvider $provider */
            $provider = \Craft::$container->get(FieldTypesProvider::class);
            foreach ($provider->getTypes() as $type) {
                $shorthand = method_exists($type, 'getType')
                    ? $type->getType()
                    : ($type->type ?? null);

                if ($shorthand === $fieldTypeShorthand) {
                    $fieldTypeDto = $type;

                    break;
                }
            }

            if ($fieldTypeDto) {
                $class = $fieldTypeDto->typeClass ?? (method_exists($fieldTypeDto, 'getTypeClass') ? $fieldTypeDto->getTypeClass() : null);
                if ($class && class_exists($class)) {
                    $reflection = new \ReflectionClass($class);

                    // Look for the protected property that holds the FieldAttributesCollection
                    if ($reflection->hasProperty('attributes')) {
                        $property = $reflection->getProperty('attributes');

                        /*
                         * #[Input\Attributes(... tabs: [...])] metadata like:
                         * [
                         *   ['handle' => 'container', ...],
                         *   ['handle' => 'input', ...],
                         *   ['handle' => 'optionLabel', ...],
                         *   ...
                         * ]
                         */
                        $attributes = $property->getAttributes(Attributes::class);
                        if (!empty($attributes)) {
                            /** @var Attributes $instance */
                            $instance = $attributes[0]->newInstance();

                            $handles = array_map(
                                static fn ($tab) => $tab['handle'] ?? null,
                                $instance->tabs ?? []
                            );

                            return array_values(array_filter($handles));
                        }
                    }
                }
            }
        } catch (\Throwable) {
            // swallow; fallback below
        }

        // Fallback mapping for any tricky types.
        static $fallback = [
            // e.g 'opinion-scale' => ['container', 'input', 'optionLabel', 'option', 'label', 'instructions', 'error'],
        ];

        return $fallback[$fieldTypeShorthand] ?? [];
    }
}
