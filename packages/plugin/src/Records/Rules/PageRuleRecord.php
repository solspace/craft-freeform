<?php

namespace Solspace\Freeform\Records\Rules;

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

    public function getRule(): ActiveQuery
    {
        return $this->hasOne(RuleRecord::class, ['id' => 'id']);
    }

    public function rules(): array
    {
        return [
            [['pageId'], 'required'],
        ];
    }
}
