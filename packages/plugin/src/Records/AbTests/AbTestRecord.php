<?php

namespace Solspace\Freeform\Records\AbTests;

use craft\db\ActiveRecord;

/**
 * @property int    $id
 * @property string $name
 * @property string $description
 * @property string $startDate
 */
class AbTestRecord extends ActiveRecord
{
    public const TABLE = '{{%freeform_ab_tests}}';

    /**
     * Returns the name of the associated database table.
     */
    public static function tableName(): string
    {
        return self::TABLE;
    }

    public function rules(): array
    {
        return [
            [['name'], 'unique'],
        ];
    }
}
