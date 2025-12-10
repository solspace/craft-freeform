<?php

namespace Solspace\Freeform\Records\AbTests;

use craft\db\ActiveRecord;

/**
 * @property int    $id
 * @property int    $abTestId
 * @property int    $formId
 * @property string $sessionId
 * @property string $status
 * @property string $lastError
 * @property string $lastField
 */
class AbTestStatisticsRecord extends ActiveRecord
{
    public const TABLE = '{{%freeform_ab_tests_statistics}}';

    public static function tableName(): string
    {
        return self::TABLE;
    }
}
