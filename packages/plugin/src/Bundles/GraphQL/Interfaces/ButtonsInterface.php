<?php

namespace Solspace\Freeform\Bundles\GraphQL\Interfaces;

use GraphQL\Type\Definition\Type;
use Solspace\Freeform\Bundles\GraphQL\Types\ButtonsType;
use Solspace\Freeform\Bundles\GraphQL\Types\Generators\ButtonsGenerator;

class ButtonsInterface extends AbstractInterface
{
    public static function getName(): string
    {
        return 'FreeformButtonsInterface';
    }

    public static function getTypeClass(): string
    {
        return ButtonsType::class;
    }

    public static function getGeneratorClass(): string
    {
        return ButtonsGenerator::class;
    }

    public static function getDescription(): string
    {
        return 'Freeform Buttons GraphQL Interface';
    }

    public static function getFieldDefinitions(): array
    {
        return \Craft::$app->gql->prepareFieldDefinitions([
            'layout' => [
                'name' => 'layout',
                'type' => Type::string(),
                'description' => 'The button layout',
            ],
            'submitLabel' => [
                'name' => 'submitLabel',
                'type' => Type::string(),
                'description' => 'The button submit label',
            ],
            'back' => [
                'name' => 'back',
                'type' => Type::boolean(),
                'description' => 'Whether the button has back button or not',
            ],
            'backLabel' => [
                'name' => 'backLabel',
                'type' => Type::string(),
                'description' => 'The button back label',
            ],
            'save' => [
                'name' => 'save',
                'type' => Type::boolean(),
                'description' => 'Whether the button has save button or not',
            ],
            'saveLabel' => [
                'name' => 'saveLabel',
                'type' => Type::string(),
                'description' => 'The button save label',
            ],
            'saveRedirectUrl' => [
                'name' => 'saveRedirectUrl',
                'type' => Type::string(),
                'description' => 'The button save redirect URL',
            ],
            'emailField' => [
                'name' => 'emailField',
                'type' => FieldInterface::getType(),
                'description' => 'The button email notification recipient',
            ],
            'notificationTemplate' => [
                'name' => 'notificationTemplate',
                'type' => NotificationTemplateInterface::getType(),
                'description' => 'The button email notification template',
            ],
            'attributes' => [
                'name' => 'attributes',
                'type' => ButtonsAttributesInterface::getType(),
                'description' => 'The button attributes',
                'resolve' => function ($source) {
                    return $source->getAttributes();
                },
            ],
        ], static::getName());
    }
}
