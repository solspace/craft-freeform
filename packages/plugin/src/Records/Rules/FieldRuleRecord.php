<?php

namespace Solspace\Freeform\Records\Rules;

use Solspace\Freeform\Records\Form\FormFieldRecord;
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

    /**
     * @return FieldRuleRecord[]
     */
    public static function getExistingRules(?int $formId): array
    {
        if (null === $formId) {
            return [];
        }

        /** @var FieldRuleRecord[] $records */
        $records = self::find()
            ->select(['fr.*'])
            ->from(self::TABLE.' fr')
            ->innerJoin(RuleRecord::TABLE.' r', '[[fr.id]] = [[r.id]]')
            ->innerJoin(FormFieldRecord::TABLE.' ff', '[[fr.fieldId]] = [[ff.id]]')
            ->where(['ff.formId' => $formId])
            ->with('rule', 'conditions', 'field')
            ->indexBy('id')
            ->all()
        ;

        $indexed = [];
        foreach ($records as $record) {
            $indexed[$record->getRule()->one()->uid] = $record;
        }

        return $indexed;
    }

    public static function getExistingRule(int $fieldId): ?self
    {
        return self::find()
            ->select(['fr.*'])
            ->from(self::TABLE.' fr')
            ->innerJoin(RuleRecord::TABLE.' r', '[[fr.id]] = [[r.id]]')
            ->innerJoin(FormFieldRecord::TABLE.' ff', '[[fr.fieldId]] = [[ff.id]]')
            ->where(['fr.fieldId' => $fieldId])
            ->with('rule', 'conditions', 'field')
            ->indexBy('id')
            ->one()
        ;
    }

    public function getRule(): ActiveQuery
    {
        return $this->hasOne(RuleRecord::class, ['id' => 'id']);
    }

    public function getField(): ActiveQuery
    {
        return $this->hasOne(FormFieldRecord::class, ['id' => 'fieldId']);
    }

    public function rules(): array
    {
        return [
            [['fieldId', 'display'], 'required'],
        ];
    }
}
