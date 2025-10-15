<?php

namespace Solspace\Freeform\Bundles\Rules\Types;

use Solspace\Freeform\Attributes\Property\Implementations\Field\FieldTransformer;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Rules\Condition;
use Solspace\Freeform\Library\Rules\ConditionCollection;
use Solspace\Freeform\Library\Rules\Types\IntegrationRule;
use Solspace\Freeform\Records\Form\FormIntegrationRecord;
use Solspace\Freeform\Records\Rules\IntegrationRuleRecord;
use Solspace\Freeform\Records\Rules\RuleRecord;

class IntegrationRuleProvider
{
    private ?array $cache = null;

    public function __construct(
        private FieldTransformer $fieldTransformer
    ) {}

    public function getByForm(Form $form): array
    {
        $rules = $this->getAllIntegrations();
        $rules = array_filter(
            $rules,
            fn (IntegrationRuleRecord $record) => $record->getIntegration()->one()->formId === $form->getId()
        );

        $integrationRules = [];
        foreach ($rules as $rule) {
            $integrationRules[] = $this->createRuleFromRecord($rule);
        }

        return $integrationRules;
    }

    public function getByUid(string $uid): ?IntegrationRule
    {
        $record = $this->getAllIntegrations()[$uid] ?? null;
        if (!$record) {
            return null;
        }

        return $this->createRuleFromRecord($record);
    }

    private function getAllIntegrations(): array
    {
        if (null === $this->cache) {
            $items = IntegrationRuleRecord::find()
                ->select(['ir.*'])
                ->from(IntegrationRuleRecord::TABLE.' ir')
                ->innerJoin(RuleRecord::TABLE.' r', '[[ir.id]] = [[r.id]]')
                ->innerJoin(FormIntegrationRecord::TABLE.' fi', '[[ir.integrationId]] = [[fi.id]]')
                ->with('rule', 'conditions', 'integration')
                ->all()
            ;

            $this->cache = [];
            foreach ($items as $item) {
                $this->cache[$item->getRule()->one()->uid] = $item;
            }
        }

        return $this->cache;
    }

    private function createRuleFromRecord(IntegrationRuleRecord $record): IntegrationRule
    {
        $conditions = new ConditionCollection();
        foreach ($record->getConditions()->all() as $conditionRecord) {
            $field = $this->fieldTransformer->transform($conditionRecord->getField()->one()?->uid);
            if (!$field) {
                continue;
            }

            $condition = new Condition(
                $conditionRecord->uid,
                $field,
                $conditionRecord->operator,
                $conditionRecord->value
            );

            $conditions->add($condition);
        }

        $ruleRecord = $record->getRule()->one();

        $rule = new IntegrationRule(
            $ruleRecord->id,
            $ruleRecord->uid,
            $ruleRecord->combinator,
            $conditions,
        );

        $rule->setPush($record->push);

        return $rule;
    }
}
