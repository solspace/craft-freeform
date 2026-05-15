<?php

namespace Solspace\Freeform\Records\Rules;

use Solspace\Freeform\Records\Form\FormIntegrationRecord;
use yii\db\ActiveQuery;

/**
 * @property int                   $id
 * @property int                   $integrationId
 * @property bool                  $push
 * @property \DateTime             $dateCreated
 * @property \DateTime             $dateUpdated
 * @property string                $uid
 * @property RuleRecord            $rule
 * @property FormIntegrationRecord $integration
 */
class IntegrationRuleRecord extends RuleRecord
{
    public const TABLE = '{{%freeform_rules_integrations}}';

    public static function tableName(): string
    {
        return self::TABLE;
    }

    /**
     * @return self[]
     */
    public static function getExistingRules(int $formId): array
    {
        /** @var IntegrationRuleRecord[] $records */
        $records = self::find()
            ->select(['ir.*'])
            ->from(self::TABLE.' ir')
            ->innerJoin(RuleRecord::TABLE.' r', '[[ir.id]] = [[r.id]]')
            ->innerJoin(FormIntegrationRecord::TABLE.' fi', '[[ir.integrationId]] = [[fi.id]]')
            ->where(['fi.formId' => $formId])
            ->with('rule.conditions.integration', 'integration')
            ->indexBy('id')
            ->all()
        ;

        $indexed = [];
        foreach ($records as $record) {
            $indexed[$record->rule->uid] = $record;
        }

        return $indexed;
    }

    public function getRule(): ActiveQuery
    {
        return $this->hasOne(RuleRecord::class, ['id' => 'id']);
    }

    public function getIntegration(): ActiveQuery
    {
        return $this->hasOne(FormIntegrationRecord::class, ['id' => 'integrationId']);
    }

    public function rules(): array
    {
        return [
            [['integrationId'], 'required'],
        ];
    }

    public function safeAttributes(): array
    {
        return [
            'integrationId',
            'send',
        ];
    }
}
