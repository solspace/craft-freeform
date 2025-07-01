<?php

namespace Solspace\Freeform\Bundles\GraphQL\Types;

use craft\gql\GqlEntityRegistry;
use GraphQL\Type\Definition\ScalarType;
use GraphQL\Type\Definition\Type;

class ArrayType extends ScalarType
{
    public static function getName(): string
    {
        return 'FreeformArrayType';
    }

    public static function getType(): Type
    {
        if ($type = GqlEntityRegistry::getEntity(self::getName())) {
            return $type;
        }

        return GqlEntityRegistry::createEntity(self::getName(), new self());
    }

    public function serialize(mixed $value): mixed
    {
        if (!\is_array($value)) {
            $value->toArray();
        }

        return $value;
    }

    public function parseValue(mixed $value): mixed
    {
        return $value;
    }

    public function parseLiteral(mixed $valueNode, ?array $variables = null): mixed
    {
        return $valueNode;
    }
}
