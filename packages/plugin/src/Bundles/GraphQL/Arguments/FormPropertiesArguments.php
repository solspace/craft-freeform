<?php

namespace Solspace\Freeform\Bundles\GraphQL\Arguments;

use craft\gql\base\Arguments;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\DynamicNotificationInterface;

class FormPropertiesArguments extends Arguments
{
    public static function getArguments(): array
    {
        return [
            'dynamicNotification' => [
                'name' => 'dynamicNotification',
                'type' => DynamicNotificationInterface::getType(),
                'description' => 'Allows using a dynamic template level notification for a more fine-grained control.',
            ],
        ];
    }
}
