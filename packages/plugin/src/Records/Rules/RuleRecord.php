<?php

namespace Solspace\Freeform\Records\Rules;

use craft\db\ActiveRecord;
use yii\db\ActiveQuery;

/**
 * @property int       $id
 * @property string    $combinator
 * @property \DateTime $dateCreated
 * @property \DateTime $dateUpdated
 * @property string    $uid
 */
class RuleRecord extends ActiveRecord
{
    public const TABLE = '{{%freeform_rules}}';

    public static function tableName(): string
    {
        return self::TABLE;
    }

    public function getConditions(): ActiveQuery
    {
        return $this->hasMany(RuleConditionRecord::class, ['ruleId' => 'id']);
    }

    public function rules(): array
    {
        return [
            [['combinator'], 'required'],
        ];
    }
}
