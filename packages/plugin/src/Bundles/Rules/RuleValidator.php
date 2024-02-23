<?php

namespace Solspace\Freeform\Bundles\Rules;

use Solspace\Freeform\Events\Rules\ProcessPostedRuleValueEvent;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Rules\Rule;
use Solspace\Freeform\Library\Rules\RuleInterface;
use Solspace\Freeform\Library\Rules\Types\FieldRule;
use yii\base\Event;

class RuleValidator
{
    public const EVENT_PROCESS_POSTED_RULE_VALUE = 'process-posted-rule-value';

    public function __construct(
        private RuleProvider $ruleProvider,
        private ConditionValidator $conditionValidator,
    ) {}

    public function isFieldHidden(Form $form, FieldInterface $field): bool
    {
        $rule = $this->ruleProvider->getFieldRule($form, $field);
        if (!$rule) {
            return false;
        }

        $shouldShow = FieldRule::DISPLAY_SHOW === $rule->getDisplay();
        $triggersRule = $this->triggersRule($form, $rule);

        return $shouldShow ? !$triggersRule : $triggersRule;
    }

    public function getPageJumpIndex(Form $form): ?int
    {
        $rules = $this->ruleProvider->getPageRules($form);
        $currentPage = $form->getCurrentPage();

        foreach ($rules as $rule) {
            foreach ($rule->getConditions() as $condition) {
                if (!$currentPage->getFields()->get($condition->getField())) {
                    return null;
                }
            }

            if ($this->triggersRule($form, $rule)) {
                return $rule->getPage()->getIndex();
            }
        }

        return null;
    }

    private function triggersRule(Form $form, RuleInterface $rule): bool
    {
        $conditions = $rule->getConditions();

        $matchesSome = false;
        $matchesAll = true;
        foreach ($conditions as $condition) {
            $isConditionFieldHidden = $this->isFieldHidden($form, $condition->getField());
            if ($isConditionFieldHidden) {
                $postedValue = null;
            } else {
                $event = new ProcessPostedRuleValueEvent($condition->getField());
                Event::trigger($this, self::EVENT_PROCESS_POSTED_RULE_VALUE, $event);

                $postedValue = $event->getValue();
            }

            $valueMatch = $this->conditionValidator->validate($condition, $postedValue);
            if ($valueMatch) {
                $matchesSome = true;
            } else {
                $matchesAll = false;
            }
        }

        return match ($rule->getCombinator()) {
            Rule::COMBINATOR_AND => $matchesAll,
            Rule::COMBINATOR_OR => $matchesSome,
        };
    }
}
