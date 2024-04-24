<?php

namespace Solspace\Freeform\Records\Rules;

use Solspace\Freeform\Records\Form\FormPageRecord;
use yii\db\ActiveQuery;

/**
 * @property int       $id
 * @property int       $pageId
 * @property string    $button
 * @property \DateTime $dateCreated
 * @property \DateTime $dateUpdated
 * @property string    $uid
 */
class ButtonRuleRecord extends RuleRecord
{
    public const TABLE = '{{%freeform_rules_buttons}}';

    public static function tableName(): string
    {
        return self::TABLE;
    }

    /**
     * @return ButtonRuleRecord[]
     */
    public static function getExistingRules(int $formId): array
    {
        /** @var ButtonRuleRecord[] $records */
        $records = self::find()
            ->select(['br.*'])
            ->from(self::TABLE.' br')
            ->innerJoin(RuleRecord::TABLE.' r', '[[br.id]] = [[r.id]]')
            ->innerJoin(FormPageRecord::TABLE.' fp', '[[br.pageId]] = [[fp.id]]')
            ->where(['fp.formId' => $formId])
            ->with('rule', 'conditions', 'page')
            ->indexBy('id')
            ->all()
        ;

        $indexed = [];
        foreach ($records as $record) {
            $indexed[$record->getRule()->one()->uid] = $record;
        }

        return $indexed;
    }

    public function getRule(): ActiveQuery
    {
        return $this->hasOne(RuleRecord::class, ['id' => 'id']);
    }

    public function getPage(): ActiveQuery
    {
        return $this->hasOne(FormPageRecord::class, ['id' => 'pageId']);
    }

    public function rules(): array
    {
        return [
            [['pageId', 'button'], 'required'],
        ];
    }
}
