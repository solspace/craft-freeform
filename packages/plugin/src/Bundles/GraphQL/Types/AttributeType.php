<?php

namespace Solspace\Freeform\Bundles\GraphQL\Types;

use craft\gql\base\ObjectType;
use GraphQL\Type\Definition\Type;

class AttributeType extends ObjectType
{
    public static function getName(): string
    {
        return 'FreeformAttributeType';
    }

    public static function prepareRowFieldDefinition(string $typeName): array
    {
        $fields = [
            'attribute' => Type::string(),
            'value' => Type::string(),
        ];

        return \Craft::$app->getGql()->prepareFieldDefinitions($fields, $typeName);
    }
}
