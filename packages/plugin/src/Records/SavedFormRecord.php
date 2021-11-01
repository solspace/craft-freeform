<?php

namespace Solspace\Freeform\Records;

use craft\db\ActiveRecord;

/**
 * @property int    $id
 * @property string $sessionId
 * @property int    $formId
 * @property string $token
 * @property string $payload
 */
class SavedFormRecord extends ActiveRecord
{
    const TABLE = '{{%freeform_saved_forms}}';

    public static function tableName(): string
    {
        return self::TABLE;
    }
}
