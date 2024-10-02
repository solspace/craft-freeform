<?php

namespace Solspace\Freeform\Records\Rules;

use Solspace\Freeform\Records\Form\FormFieldRecord;
use yii\db\ActiveQuery;
use yii\db\ActiveRecord;

/**
 * @property int       $id
 * @property int       $ruleId
 * @property int       $fieldId
 * @property string    $operator
 * @property string    $value
 * @property \DateTime $dateCreated
 * @property \DateTime $dateUpdated
 * @property string    $uid
 */
class RuleConditionRecord extends ActiveRecord
{
    public const TABLE = '{{%freeform_rules_conditions}}';

    public static function tableName(): string
    {
        return self::TABLE;
    }

    public function getField(): ActiveQuery
    {
        return $this->hasOne(FormFieldRecord::class, ['id' => 'fieldId']);
    }

    public function rules(): array
    {
        return [
            [['ruleId', 'fieldId', 'operator'], 'required'],
        ];
    }

    public function safeAttributes(): array
    {
        return [
            'ruleId',
            'fieldId',
            'operator',
            'value',
        ];
    }
}
