<?php

namespace Solspace\Freeform\Services\Headless\Manifest;

use Solspace\Freeform\Bundles\Rules\RuleProvider;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Rules\Condition;
use Solspace\Freeform\Library\Rules\RuleInterface;
use Solspace\Freeform\Library\Rules\Types\ButtonRule;
use Solspace\Freeform\Library\Rules\Types\FieldRule;
use Solspace\Freeform\Library\Rules\Types\PageRule;
use Solspace\Freeform\Library\Rules\Types\SubmitFormRule;

class ManifestConditionalSerializer
{
    /**
     * @return array{fields: array, pages: array, buttons: array, submit: array}
     */
    public function serialize(Form $form, RuleProvider $ruleProvider): array
    {
        $rules = $ruleProvider->getFormRules($form);

        return [
            'fields' => $this->serializeFieldRules($rules['fields'] ?? []),
            'pages' => $this->serializePageRules($rules['pages'] ?? []),
            'buttons' => $this->serializeButtonRules($rules['buttons'] ?? []),
            'submit' => $this->serializeSubmitRule($rules['submitForm'] ?? null),
        ];
    }

    /**
     * @param FieldRule[] $rules
     *
     * @return array<int, array<string, mixed>>
     */
    private function serializeFieldRules(array $rules): array
    {
        $serialized = [];
        foreach ($rules as $rule) {
            if (!$rule instanceof FieldRule) {
                continue;
            }

            $serialized[] = [
                'target' => $rule->getFieldHandle(),
                'action' => $rule->getDisplay(),
                'logic' => 'or' === $rule->getCombinator() ? 'any' : 'all',
                'conditions' => $this->serializeConditions($rule),
            ];
        }

        return $serialized;
    }

    /**
     * @param PageRule[] $rules
     *
     * @return array<int, array<string, mixed>>
     */
    private function serializePageRules(array $rules): array
    {
        $serialized = [];
        foreach ($rules as $rule) {
            if (!$rule instanceof PageRule) {
                continue;
            }

            $page = $rule->getPage();
            $serialized[] = [
                'target' => $page?->getUid() ?? (string) $page?->getIndex(),
                'action' => 'show',
                'logic' => 'or' === $rule->getCombinator() ? 'any' : 'all',
                'conditions' => $this->serializeConditions($rule),
            ];
        }

        return $serialized;
    }

    /**
     * @param ButtonRule[] $rules
     *
     * @return array<int, array<string, mixed>>
     */
    private function serializeButtonRules(array $rules): array
    {
        $serialized = [];
        foreach ($rules as $rule) {
            if (!$rule instanceof ButtonRule) {
                continue;
            }

            $serialized[] = [
                'target' => $rule->getButton(),
                'action' => $rule->getDisplay(),
                'logic' => 'or' === $rule->getCombinator() ? 'any' : 'all',
                'conditions' => $this->serializeConditions($rule),
            ];
        }

        return $serialized;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function serializeSubmitRule(?SubmitFormRule $rule): array
    {
        if (!$rule instanceof SubmitFormRule) {
            return [];
        }

        return [[
            'target' => 'submit',
            'action' => 'enable',
            'logic' => 'or' === $rule->getCombinator() ? 'any' : 'all',
            'conditions' => $this->serializeConditions($rule),
        ]];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function serializeConditions(RuleInterface $rule): array
    {
        $conditions = [];
        foreach ($rule->getConditions() as $condition) {
            if (!$condition instanceof Condition) {
                continue;
            }

            $conditions[] = [
                'field' => $condition->getFieldHandle(),
                'operator' => $condition->getOperator(),
                'value' => $condition->getValue(),
            ];
        }

        return $conditions;
    }
}
