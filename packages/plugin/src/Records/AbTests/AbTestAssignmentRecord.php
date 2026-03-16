<?php

namespace Solspace\Freeform\Records\AbTests;

use craft\db\ActiveRecord;
use yii\db\ActiveQuery;

/**
 * @property int $id
 * @property int $userId
 * @property int $abTestId
 * @property int $abVariantId
 */
class AbTestAssignmentRecord extends ActiveRecord
{
    public const TABLE = '{{%freeform_ab_tests_assignments}}';

    public static function tableName(): string
    {
        return self::TABLE;
    }

    public function getAbTestVariant(): ActiveQuery
    {
        return $this->hasOne(AbTestVariantRecord::class, ['id' => 'abVariantId']);
    }
}
