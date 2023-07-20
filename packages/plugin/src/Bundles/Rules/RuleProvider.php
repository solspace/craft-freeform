<?php

namespace Solspace\Freeform\Bundles\Rules;

use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Rules\Condition;
use Solspace\Freeform\Library\Rules\ConditionCollection;
use Solspace\Freeform\Library\Rules\Types\FieldRule;
use Solspace\Freeform\Library\Rules\Types\PageRule;
use Solspace\Freeform\Records\Rules\FieldRuleRecord;
use Solspace\Freeform\Records\Rules\NotificationRuleRecord;
use Solspace\Freeform\Records\Rules\PageRuleRecord;
use Solspace\Freeform\Records\Rules\RuleConditionRecord;
use Solspace\Freeform\Records\Rules\RuleRecord;

class RuleProvider
{
    private static array $fieldRuleCache = [];

    public function getFormRules(?Form $form): array
    {
        if (!$form) {
            return [
                'pages' => [],
                'fields' => [],
            ];
        }

        return [
            'pages' => $this->getPageRules($form),
            'fields' => $this->getFieldRules($form),
        ];
    }

    /**
     * @return FieldRule[]
     */
    public function getFieldRules(Form $form): array
    {
        if (!isset(self::$fieldRuleCache[$form->getId()])) {
            $records = FieldRuleRecord::getExistingRules($form->getId());

            $rules = [];
            foreach ($records as $fieldRule) {
                $rules[] = $this->createFieldRuleFromRecord($form, $fieldRule);
            }

            self::$fieldRuleCache[$form->getId()] = $rules;
        }

        return self::$fieldRuleCache[$form->getId()];
    }

    public function getFieldRule(Form $form, FieldInterface $field): ?FieldRule
    {
        $rules = $this->getFieldRules($form);
        foreach ($rules as $rule) {
            if ($rule->getField() === $field) {
                return $rule;
            }
        }

        return null;
    }

    public function getPageRules(Form $form): array
    {
        $rules = PageRuleRecord::getExistingRules($form->getId());

        $array = [];
        foreach ($rules as $uid => $pageRule) {
            /** @var RuleRecord $rule */
            $ruleRecord = $pageRule->getRule()->one();
            $rule = new PageRule(
                $pageRule->id,
                $uid,
                $ruleRecord->combinator,
                $this->compileConditions($form, $ruleRecord),
            );

            $rule->setPage($form->getLayout()->getPages()->get($pageRule->pageId));

            $array[] = $rule;
        }

        return $array;
    }

    public function getFormNotificationRules(?Form $form): array
    {
        if (!$form) {
            return [];
        }

        return $this->getNotificationRuleArray($form);
    }

    private function createFieldRuleFromRecord(Form $form, FieldRuleRecord $record): FieldRule
    {
        $ruleRecord = $record->getRule()->one();

        $rule = new FieldRule(
            $record->id,
            $ruleRecord->uid,
            $ruleRecord->combinator,
            $this->compileConditions($form, $ruleRecord),
        );

        $rule->setDisplay($record->display);
        $rule->setField(
            $form->get($record->getField()->one()->uid)
        );

        return $rule;
    }

    private function getNotificationRuleArray(Form $form): array
    {
        $rules = NotificationRuleRecord::getExistingRules($form->getId());

        $array = [];
        foreach ($rules as $uid => $notificationRule) {
            /** @var RuleRecord $rule */
            $rule = $notificationRule->getRule()->one();

            $conditions = [];

            /** @var RuleConditionRecord $condition */
            foreach ($rule->getConditions()->all() as $condition) {
                $conditions[] = [
                    'uid' => $condition->uid,
                    'field' => $condition->getField()->one()->uid,
                    'operator' => $condition->operator,
                    'value' => $condition->value,
                ];
            }

            $array[] = [
                'uid' => $uid,
                'notification' => $notificationRule->getNotification()->one()->uid,
                'enabled' => true,
                'send' => $notificationRule->send,
                'combinator' => $rule->combinator,
                'conditions' => $conditions,
            ];
        }

        return $array;
    }

    private function compileConditions(Form $form, RuleRecord $ruleRecord): ConditionCollection
    {
        $conditionCollection = new ConditionCollection();

        /** @var RuleConditionRecord $condition */
        foreach ($ruleRecord->getConditions()->all() as $condition) {
            $conditionCollection->add(
                new Condition(
                    $condition->uid,
                    $form->get($condition->getField()->one()->uid),
                    $condition->operator,
                    $condition->value
                )
            );
        }

        return $conditionCollection;
    }
}
