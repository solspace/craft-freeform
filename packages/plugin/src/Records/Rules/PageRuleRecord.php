<?php

namespace Solspace\Freeform\Records\Rules;

use Solspace\Freeform\Records\Form\FormPageRecord;
use yii\db\ActiveQuery;

/**
 * @property int       $id
 * @property int       $pageId
 * @property \DateTime $dateCreated
 * @property \DateTime $dateUpdated
 * @property string    $uid
 */
class PageRuleRecord extends RuleRecord
{
    public const TABLE = '{{%freeform_rules_pages}}';

    public static function tableName(): string
    {
        return self::TABLE;
    }

    /**
     * @return PageRuleRecord[]
     */
    public static function getExistingRules(int $formId): array
    {
        /** @var PageRuleRecord[] $records */
        $records = self::find()
            ->select(['fr.*'])
            ->from(self::TABLE.' fr')
            ->innerJoin(RuleRecord::TABLE.' r', '[[fr.id]] = [[r.id]]')
            ->innerJoin(FormPageRecord::TABLE.' fp', '[[fr.pageId]] = [[fp.id]]')
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
            [['pageId'], 'required'],
        ];
    }
}
