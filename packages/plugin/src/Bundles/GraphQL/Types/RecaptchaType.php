<?php

namespace Solspace\Freeform\Bundles\GraphQL\Types;

use craft\gql\base\ObjectType;
use craft\gql\GqlEntityRegistry;
use GraphQL\Type\Definition\Type;
use Solspace\Freeform\Bundles\GraphQL\Arguments\RecaptchaArguments;

class RecaptchaType extends ObjectType
{
    public static function getName(): string
    {
        return 'FreeformRecaptchaType';
    }

    public static function getType(): Type
    {
        if ($type = GqlEntityRegistry::getEntity(self::getName())) {
            return $type;
        }

        $fields = \Craft::$app->getGql()->prepareFieldDefinitions(
            RecaptchaArguments::getArguments(),
            self::getName()
        );

        $fields = array_merge([
            'handle' => [
                'name' => 'handle',
                'type' => Type::string(),
                'description' => 'The Recaptcha form handle',
            ],
        ], $fields);

        return GqlEntityRegistry::createEntity(self::getName(), new self([
            'name' => self::getName(),
            'fields' => function () use ($fields) {
                return $fields;
            },
        ]));
    }
}
