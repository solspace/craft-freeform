<?php

namespace Solspace\Freeform\Bundles\Rules;

use Solspace\Freeform\Events\Rules\ProcessPostedRuleValueEvent;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Rules\Rule;
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

        $shouldShow = FieldRule::DISPLAY_SHOW === $rule->getDisplay();

        return match ($rule->getCombinator()) {
            Rule::COMBINATOR_AND => $shouldShow ? !$matchesAll : $matchesAll,
            Rule::COMBINATOR_OR => $shouldShow ? !$matchesSome : $matchesSome,
        };
    }
}
