<?php

namespace Solspace\Freeform\Bundles\GraphQL\Types;

use craft\gql\GqlEntityRegistry;
use GraphQL\Error\Error;
use GraphQL\Language\AST\BooleanValueNode;
use GraphQL\Language\AST\FloatValueNode;
use GraphQL\Language\AST\IntValueNode;
use GraphQL\Language\AST\ListValueNode;
use GraphQL\Language\AST\NullValueNode;
use GraphQL\Language\AST\ObjectValueNode;
use GraphQL\Language\AST\StringValueNode;
use GraphQL\Type\Definition\ScalarType;
use GraphQL\Type\Definition\Type;

/**
 * JSON scalar for headless manifest/submit payloads (arrays/objects).
 */
class FreeformJsonType extends ScalarType
{
    public static function getName(): string
    {
        return 'FreeformJson';
    }

    public static function getType(): Type
    {
        if ($type = GqlEntityRegistry::getEntity(self::getName())) {
            return $type;
        }

        return GqlEntityRegistry::createEntity(self::getName(), new self([
            'name' => self::getName(),
            'description' => 'Arbitrary JSON value (object, array, string, number, boolean, or null).',
        ]));
    }

    public function serialize(mixed $value): mixed
    {
        return $value;
    }

    public function parseValue(mixed $value): mixed
    {
        if (\is_string($value)) {
            $decoded = json_decode($value, true);
            if (\JSON_ERROR_NONE === json_last_error()) {
                return $decoded;
            }

            return $value;
        }

        return $value;
    }

    public function parseLiteral(mixed $valueNode, ?array $variables = null): mixed
    {
        if ($valueNode instanceof NullValueNode) {
            return null;
        }

        if ($valueNode instanceof StringValueNode) {
            // GraphQL string literals are plain strings; JSON documents come via variables/parseValue.
            return $valueNode->value;
        }

        if ($valueNode instanceof BooleanValueNode) {
            return $valueNode->value;
        }

        if ($valueNode instanceof IntValueNode) {
            return (int) $valueNode->value;
        }

        if ($valueNode instanceof FloatValueNode) {
            return (float) $valueNode->value;
        }

        if ($valueNode instanceof ListValueNode) {
            $values = [];
            foreach ($valueNode->values as $node) {
                $values[] = $this->parseLiteral($node, $variables);
            }

            return $values;
        }

        if ($valueNode instanceof ObjectValueNode) {
            $object = [];
            foreach ($valueNode->fields as $field) {
                $object[$field->name->value] = $this->parseLiteral($field->value, $variables);
            }

            return $object;
        }

        throw new Error('FreeformJson cannot represent a non-JSON literal.');
    }
}
