<?php

namespace Solspace\Freeform\Bundles\Rules;

use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Rules\Condition;
use Solspace\Freeform\Library\Rules\ConditionCollection;
use Solspace\Freeform\Library\Rules\Types\FieldRule;
use Solspace\Freeform\Records\Rules\FieldRuleRecord;
use Solspace\Freeform\Records\Rules\NotificationRuleRecord;
use Solspace\Freeform\Records\Rules\PageRuleRecord;
use Solspace\Freeform\Records\Rules\RuleConditionRecord;
use Solspace\Freeform\Records\Rules\RuleRecord;

class RuleProvider
{
    public function getFormRules(?Form $form): array
    {
        if (!$form) {
            return [
                'pages' => [],
                'fields' => [],
            ];
        }

        return [
            'pages' => $this->getPageRuleArray($form),
            'fields' => $this->getFieldRuleArray($form),
        ];
    }

    public function getFieldRules(Form $form): array
    {
        $records = FieldRuleRecord::getExistingRules($form->getId());

        $rules = [];
        foreach ($records as $uid => $fieldRule) {
            /** @var RuleRecord $rule */
            $rule = $fieldRule->getRule()->one();

            $conditionCollection = new ConditionCollection();

            /** @var RuleConditionRecord $condition */
            foreach ($rule->getConditions()->all() as $condition) {
                $conditionCollection->add(
                    new Condition(
                        $condition->uid,
                        $form->get($condition->getField()->one()->uid),
                        $condition->operator,
                        $condition->value
                    )
                );
            }

            $rule = new FieldRule(
                $fieldRule->id,
                $uid,
                $fieldRule->combinator,
                $conditionCollection,
            );

            $rule->setDisplay($fieldRule->display);
            $rule->setField(
                $form->get($fieldRule->getField()->one()->uid)
            );

            $rules[] = $rule;
        }

        return $rules;
    }

    public function getFormNotificationRules(?Form $form): array
    {
        if (!$form) {
            return [];
        }

        return $this->getNotificationRuleArray($form);
    }

    private function getFieldRuleArray(Form $form): array
    {
        $rules = FieldRuleRecord::getExistingRules($form->getId());

        $array = [];
        foreach ($rules as $uid => $fieldRule) {
            /** @var RuleRecord $rule */
            $rule = $fieldRule->getRule()->one();

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
                'field' => $fieldRule->getField()->one()->uid,
                'enabled' => true,
                'display' => $fieldRule->display,
                'combinator' => $rule->combinator,
                'conditions' => $conditions,
            ];
        }

        return $array;
    }

    private function getPageRuleArray(Form $form): array
    {
        $rules = PageRuleRecord::getExistingRules($form->getId());

        $array = [];
        foreach ($rules as $uid => $pageRule) {
            /** @var RuleRecord $rule */
            $rule = $pageRule->getRule()->one();

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
                'page' => $pageRule->getPage()->one()->uid,
                'enabled' => true,
                'combinator' => $rule->combinator,
                'conditions' => $conditions,
            ];
        }

        return $array;
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
}
