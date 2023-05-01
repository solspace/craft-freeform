<?php

namespace Solspace\Freeform\Bundles\Rules;

use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Records\Rules\FieldRuleRecord;
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
            'pages' => $this->getPageRules($form),
            'fields' => $this->getFieldRules($form),
        ];
    }

    private function getFieldRules(Form $form): array
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

    private function getPageRules(Form $form): array
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
}
