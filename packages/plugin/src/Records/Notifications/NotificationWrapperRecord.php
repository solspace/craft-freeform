<?php

namespace Solspace\Freeform\Records\Notifications;

use craft\db\ActiveRecord;

/**
 * @property int       $id
 * @property string    $name
 * @property string    $handle
 * @property string    $content
 * @property string    $description
 * @property \DateTime $dateCreated
 * @property \DateTime $dateUpdated
 * @property string    $uid
 */
class NotificationWrapperRecord extends ActiveRecord
{
    public const TABLE = '{{%freeform_notification_template_wrappers}}';

    public static function tableName(): string
    {
        return self::TABLE;
    }

    public function rules(): array
    {
        return [
            [['name', 'handle', 'content'], 'required'],
            [['handle'], 'unique'],
            [
                ['handle'],
                'match',
                'pattern' => '/^[a-zA-Z0-9_-]+$/',
                'message' => 'Use only letters, numbers, and underscores for the handle.',
            ],
        ];
    }

    public function safeAttributes(): array
    {
        return [
            'name',
            'handle',
            'content',
            'description',
        ];
    }
}
