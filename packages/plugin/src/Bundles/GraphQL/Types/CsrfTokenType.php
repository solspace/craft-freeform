<?php

namespace Solspace\Freeform\Bundles\GraphQL\Types;

use craft\gql\base\ObjectType;
use craft\gql\GqlEntityRegistry;
use GraphQL\Type\Definition\ResolveInfo;
use GraphQL\Type\Definition\Type;
use Solspace\Freeform\Bundles\GraphQL\Arguments\CsrfTokenArguments;

class CsrfTokenType extends ObjectType
{
    public static function getName(): string
    {
        return 'FreeformCsrfTokenType';
    }

    public static function getType(): Type
    {
        if ($type = GqlEntityRegistry::getEntity(self::getName())) {
            return $type;
        }

        $fields = \Craft::$app->getGql()->prepareFieldDefinitions(
            CsrfTokenArguments::getArguments(),
            self::getName()
        );

        return GqlEntityRegistry::createEntity(self::getName(), new self([
            'name' => self::getName(),
            'fields' => function () use ($fields) {
                return $fields;
            },
        ]));
    }

    /*public function resolve(mixed $source, array $arguments, mixed $context, ResolveInfo $resolveInfo): ?array
    {
        \Craft::dd(\Craft::$app->getRequest()->csrfParam);

        if (\Craft::$app->getConfig()->getGeneral()->enableCsrfProtection) {
            return [
                'name' => \Craft::$app->getRequest()->csrfParam,
                'value' => \Craft::$app->getRequest()->getCsrfToken(),
            ];
        }

        return null;
    }*/
}
