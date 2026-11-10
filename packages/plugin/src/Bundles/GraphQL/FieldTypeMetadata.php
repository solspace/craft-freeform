<?php

namespace Solspace\Freeform\Bundles\GraphQL;

use Solspace\Freeform\Attributes\Field\Type;
use Solspace\Freeform\Bundles\Fields\Types\FieldTypesProvider;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Library\Exceptions\FieldExceptions\InvalidFieldTypeException;
use Solspace\Freeform\Library\Helpers\AttributeHelper;

class FieldTypeMetadata
{
    /**
     * Read schema metadata without generating builder properties, options, or previews.
     *
     * @return array<string, class-string<FieldInterface>>
     */
    public static function getClasses(): array
    {
        $classes = [];
        $provider = \Craft::$container->get(FieldTypesProvider::class);

        foreach ($provider->getRegisteredTypes() as $class) {
            $reflection = new \ReflectionClass($class);
            if (!$reflection->implementsInterface(FieldInterface::class)) {
                continue;
            }

            $type = AttributeHelper::findAttribute($reflection, Type::class);
            if (!$type) {
                throw new InvalidFieldTypeException("Field type definition invalid for '{$class}'");
            }

            $classes[$type->typeShorthand] ??= $class;
        }

        return $classes;
    }
}
