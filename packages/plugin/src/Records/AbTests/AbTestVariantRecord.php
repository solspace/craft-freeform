<?php

namespace Solspace\Freeform\Records\AbTests;

use craft\db\ActiveRecord;

/**
 * @property int $id
 * @property int $abTestId
 * @property int $formId
 * @property int $weight
 */
class AbTestVariantRecord extends ActiveRecord
{
    public const TABLE = '{{%freeform_ab_tests_variants}}';

    public static function tableName(): string
    {
        return self::TABLE;
    }
}
