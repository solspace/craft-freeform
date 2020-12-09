<?php

namespace Solspace\Freeform\Records;

use craft\db\ActiveRecord;

/**
 * @property int    $id
 * @property string $hash
 * @property string $min
 * @property string $max
 * @property string $issueDate
 */
class FeedRecord extends ActiveRecord
{
    const TABLE = '{{%freeform_feeds}}';

    public static function tableName(): string
    {
        return self::TABLE;
    }
}
