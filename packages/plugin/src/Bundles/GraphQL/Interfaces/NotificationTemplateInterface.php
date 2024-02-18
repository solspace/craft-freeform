<?php

namespace Solspace\Freeform\Bundles\GraphQL\Interfaces;

use GraphQL\Type\Definition\Type;
use Solspace\Freeform\Bundles\GraphQL\Types\Generators\NotificationTemplateGenerator;
use Solspace\Freeform\Bundles\GraphQL\Types\NotificationTemplateType;

class NotificationTemplateInterface extends AbstractInterface
{
    public static function getName(): string
    {
        return 'FreeformNotificationTemplateInterface';
    }

    public static function getTypeClass(): string
    {
        return NotificationTemplateType::class;
    }

    public static function getGeneratorClass(): string
    {
        return NotificationTemplateGenerator::class;
    }

    public static function getDescription(): string
    {
        return 'Freeform Notification Template GraphQL Interface';
    }

    public static function getFieldDefinitions(): array
    {
        return \Craft::$app->gql->prepareFieldDefinitions([
            'id' => [
                'name' => 'id',
                'type' => Type::string(),
                'description' => 'The ID of the notification template',
            ],
            'name' => [
                'name' => 'name',
                'type' => Type::string(),
                'description' => 'The name of the notification template',
            ],
            'handle' => [
                'name' => 'handle',
                'type' => Type::string(),
                'description' => 'The file name of the notification template',
            ],
            'description' => [
                'name' => 'description',
                'type' => Type::string(),
                'description' => 'The description of the notification template',
            ],
            'fromEmail' => [
                'name' => 'fromEmail',
                'type' => Type::string(),
                'description' => 'The from email that will appear in the notification template',
            ],
            'fromName' => [
                'name' => 'fromName',
                'type' => Type::string(),
                'description' => 'The from name that will appear in the notification template',
            ],
            'replyToName' => [
                'name' => 'replyToName',
                'type' => Type::string(),
                'description' => 'The reply to name that will appear in the notification template',
            ],
            'replyToEmail' => [
                'name' => 'replyToEmail',
                'type' => Type::string(),
                'description' => 'The reply to email that will appear in the notification template',
            ],
            'cc' => [
                'name' => 'cc',
                'type' => Type::string(),
                'description' => "The email address(es) you would like to be CC'd in the notification template",
            ],
            'bcc' => [
                'name' => 'bcc',
                'type' => Type::string(),
                'description' => "The email address(es) you would like to be BCC'd of the notification template",
            ],
            'includeAttachments' => [
                'name' => 'includeAttachments',
                'type' => Type::boolean(),
                'description' => 'Whether to include attachments in the notification template or not',
            ],
            'presetAssets' => [
                'name' => 'presetAssets',
                'type' => Type::listOf(Type::string()),
                'description' => 'Assets included as attachments in the notification template',
            ],
            'subject' => [
                'name' => 'subject',
                'type' => Type::string(),
                'description' => 'The subject of the notification template',
            ],
            'body' => [
                'name' => 'body',
                'type' => Type::string(),
                'description' => 'The HTML content of the notification template',
            ],
            'textBody' => [
                'name' => 'textBody',
                'type' => Type::string(),
                'description' => 'The text content of the notification template',
            ],
            'autoText' => [
                'name' => 'autoText',
                'type' => Type::boolean(),
                'description' => 'Whether Freeform will automatically provide a Text-only version of the notification based on the HTML version',
            ],
        ], static::getName());
    }
}
