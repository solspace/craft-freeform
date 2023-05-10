<?php

namespace Solspace\Freeform\Bundles\GraphQL\Types;

use craft\gql\base\ObjectType;
use craft\gql\GqlEntityRegistry;
use GraphQL\Type\Definition\Type;
use Solspace\Freeform\Bundles\GraphQL\Arguments\HoneypotArguments;

class HoneypotType extends ObjectType
{
    public static function getName(): string
    {
        return 'FreeformHoneypotType';
    }

    public static function getType(): Type
    {
        if ($type = GqlEntityRegistry::getEntity(self::getName())) {
            return $type;
        }

        $fields = \Craft::$app->getGql()->prepareFieldDefinitions(
            HoneypotArguments::getArguments(),
            self::getName()
        );

        return GqlEntityRegistry::createEntity(self::getName(), new self([
            'name' => self::getName(),
            'fields' => function () use ($fields) {
                return $fields;
            },
        ]));
    }
}
