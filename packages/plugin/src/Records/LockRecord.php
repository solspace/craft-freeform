<?php

namespace Solspace\Freeform\Records;

use craft\db\ActiveRecord;

/**
 * @property int    $id
 * @property string $key
 */
class LockRecord extends ActiveRecord
{
    const TABLE = '{{%freeform_lock}}';

    public static function tableName(): string
    {
        return self::TABLE;
    }
}
