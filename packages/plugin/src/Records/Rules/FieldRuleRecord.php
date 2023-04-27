<?php

namespace Solspace\Freeform\Records\Rules;

use yii\db\ActiveQuery;

/**
 * @property int       $id
 * @property int       $ruleId
 * @property int       $fieldId
 * @property string    $display
 * @property \DateTime $dateCreated
 * @property \DateTime $dateUpdated
 * @property string    $uid
 */
class FieldRuleRecord extends RuleRecord
{
    public const TABLE = '{{%freeform_rules_fields}}';

    public static function tableName(): string
    {
        return self::TABLE;
    }

    public function getRule(): ActiveQuery
    {
        return $this->hasOne(RuleRecord::class, ['id' => 'id']);
    }

    public function rules(): array
    {
        return [
            [['fieldId', 'display'], 'required'],
        ];
    }
}
