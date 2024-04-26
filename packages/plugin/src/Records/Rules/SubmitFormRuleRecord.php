<?php

namespace Solspace\Freeform\Records\Rules;

use Solspace\Freeform\Records\FormRecord;
use yii\db\ActiveQuery;

/**
 * @property int       $id
 * @property int       $formId
 * @property \DateTime $dateCreated
 * @property \DateTime $dateUpdated
 * @property string    $uid
 */
class SubmitFormRuleRecord extends RuleRecord
{
    public const TABLE = '{{%freeform_rules_submit_form}}';

    public static function tableName(): string
    {
        return self::TABLE;
    }

    public static function getExistingRule(int $formId): ?self
    {
        return self::find()
            ->select(['fr.*'])
            ->from(self::TABLE.' fr')
            ->innerJoin(RuleRecord::TABLE.' r', '[[fr.id]] = [[r.id]]')
            ->innerJoin(FormRecord::TABLE.' ff', '[[fr.formId]] = [[ff.id]]')
            ->where(['ff.id' => $formId])
            ->with('rule', 'conditions', 'form')
            ->indexBy('id')
            ->one()
        ;
    }

    public function getRule(): ActiveQuery
    {
        return $this->hasOne(RuleRecord::class, ['id' => 'id']);
    }

    public function getForm(): ActiveQuery
    {
        return $this->hasOne(FormRecord::class, ['id' => 'formId']);
    }

    public function rules(): array
    {
        return [
            [['formId'], 'required'],
        ];
    }
}
