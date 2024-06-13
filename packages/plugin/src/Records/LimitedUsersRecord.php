<?php

namespace Solspace\Freeform\Records;

use craft\db\ActiveRecord;

/**
 * @property int    $id
 * @property string $name
 * @property string $description
 * @property string $settings
 */
class LimitedUsersRecord extends ActiveRecord
{
    public const TABLE = '{{%freeform_limited_users}}';

    public static function tableName(): string
    {
        return self::TABLE;
    }

    public function rules(): array
    {
        return [
            [['name'], 'required'],
            [['name'], 'unique'],
        ];
    }
}
