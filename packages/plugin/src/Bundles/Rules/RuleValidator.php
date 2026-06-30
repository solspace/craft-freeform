<?php

namespace Solspace\Freeform\Bundles\Rules;

use Solspace\Freeform\Events\Rules\ProcessPostedRuleValueEvent;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Collections\PageCollection;
use Solspace\Freeform\Library\Rules\Rule;
use Solspace\Freeform\Library\Rules\RuleInterface;
use Solspace\Freeform\Library\Rules\Types\ButtonRule;
use Solspace\Freeform\Library\Rules\Types\FieldRule;
use yii\base\Event;

class RuleValidator
{
    public const EVENT_PROCESS_POSTED_RULE_VALUE = 'process-posted-rule-value';

    /** @var array<int, array<string, bool>> */
    private array $fieldHiddenCache = [];

    /** @var array<int, array<int, array<int, bool>>> */
    private array $ruleTriggerCache = [];

    /** @var array<int, array<string, mixed>> */
    private array $postedValueCache = [];

    /** @var array<int, array<string, true>> */
    private array $availableFieldHandleCache = [];

    public function __construct(
        private RuleProvider $ruleProvider,
        private ConditionValidator $conditionValidator,
    ) {}

    public function isFieldHidden(Form $form, FieldInterface $field): bool
    {
        $formKey = $this->getFormCacheKey($form);
        $fieldKey = $this->getFieldCacheKey($field);
        if (\array_key_exists($fieldKey, $this->fieldHiddenCache[$formKey] ?? [])) {
            return $this->fieldHiddenCache[$formKey][$fieldKey];
        }

        if ($this->isParentHidden($form, $field)) {
            return $this->fieldHiddenCache[$formKey][$fieldKey] = true;
        }

        $rule = $this->ruleProvider->getFieldRule($form, $field);
        if (!$rule) {
            return $this->fieldHiddenCache[$formKey][$fieldKey] = false;
        }

        if (0 === $rule->getConditions()->count()) {
            return $this->fieldHiddenCache[$formKey][$fieldKey] = false;
        }

        $shouldShow = FieldRule::DISPLAY_SHOW === $rule->getDisplay();
        $triggersRule = $this->triggersRule($form, $rule);

        return $this->fieldHiddenCache[$formKey][$fieldKey] = $shouldShow ? !$triggersRule : $triggersRule;
    }

    public function isButtonHidden(Form $form, string $button): bool
    {
        $rule = $this->ruleProvider->getButtonRule($form, $button);
        if (!$rule) {
            return false;
        }

        if (0 === $rule->getConditions()->count()) {
            return false;
        }

        $shouldShow = ButtonRule::DISPLAY_SHOW === $rule->getDisplay();
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
                    // This rule's condition references a field that isn't on the
                    // current page, so it can't be evaluated from here. Skip just
                    // this rule rather than abandoning all remaining page jumps.
                    continue 2;
                }
            }

            if ($this->triggersRule($form, $rule)) {
                return $rule->getPage()->getIndex();
            }
        }

        return null;
    }

    public function isFormSubmittable(Form $form): bool
    {
        $rule = $this->ruleProvider->getSubmitFormRule($form);
        if (!$rule) {
            return false;
        }

        $currentPage = $form->getCurrentPage();

        $availablePages = new PageCollection();
        foreach ($form->getPages() as $page) {
            if ($page->getIndex() > $currentPage->getIndex()) {
                break;
            }

            $availablePages->add($page);
        }

        return $this->triggersRule($form, $rule, $availablePages);
    }

    private function triggersRule(Form $form, RuleInterface $rule, ?PageCollection $availablePages = null): bool
    {
        $formKey = $this->getFormCacheKey($form);
        $ruleKey = \spl_object_id($rule);
        $availableKey = $availablePages ? \spl_object_id($availablePages) : 0;
        if (isset($this->ruleTriggerCache[$formKey][$availableKey][$ruleKey])) {
            return $this->ruleTriggerCache[$formKey][$availableKey][$ruleKey];
        }

        $conditions = $rule->getConditions();
        $availableFieldHandles = $availablePages ? $this->getAvailableFieldHandles($availablePages) : null;
        $combinator = $rule->getCombinator();

        $matchesSome = false;
        $matchesAll = true;
        foreach ($conditions as $condition) {
            $field = $condition->getField();

            if ($availableFieldHandles && !isset($availableFieldHandles[$this->getFieldCacheKey($field)])) {
                continue;
            }

            $isConditionFieldHidden = $this->isFieldHidden($form, $field);
            if ($isConditionFieldHidden) {
                $postedValue = null;
            } else {
                $postedValue = $this->getPostedValue($form, $field);
            }

            $valueMatch = $this->conditionValidator->validate($condition, $postedValue);
            if ($valueMatch) {
                $matchesSome = true;
                if (Rule::COMBINATOR_OR === $combinator) {
                    return $this->ruleTriggerCache[$formKey][$availableKey][$ruleKey] = true;
                }
            } else {
                $matchesAll = false;
                if (Rule::COMBINATOR_AND === $combinator) {
                    return $this->ruleTriggerCache[$formKey][$availableKey][$ruleKey] = false;
                }
            }
        }

        return $this->ruleTriggerCache[$formKey][$availableKey][$ruleKey] = match ($combinator) {
            Rule::COMBINATOR_AND => $matchesAll,
            Rule::COMBINATOR_OR => $matchesSome,
        };
    }

    private function isParentHidden(Form $form, FieldInterface $field): bool
    {
        $parent = $field->getParentField();
        if (!$parent) {
            return false;
        }

        $isHidden = $this->isFieldHidden($form, $parent);
        if ($isHidden) {
            return true;
        }

        return $this->isParentHidden($form, $parent);
    }

    private function getPostedValue(Form $form, FieldInterface $field): mixed
    {
        $formKey = $this->getFormCacheKey($form);
        $fieldKey = $this->getFieldCacheKey($field);
        if (\array_key_exists($fieldKey, $this->postedValueCache[$formKey] ?? [])) {
            return $this->postedValueCache[$formKey][$fieldKey];
        }

        $event = new ProcessPostedRuleValueEvent($field);
        Event::trigger($this, self::EVENT_PROCESS_POSTED_RULE_VALUE, $event);

        return $this->postedValueCache[$formKey][$fieldKey] = $event->getValue();
    }

    private function getAvailableFieldHandles(PageCollection $availablePages): array
    {
        $key = \spl_object_id($availablePages);
        if (isset($this->availableFieldHandleCache[$key])) {
            return $this->availableFieldHandleCache[$key];
        }

        $handles = [];
        foreach ($availablePages as $page) {
            foreach ($page->getFields() as $field) {
                $handles[$this->getFieldCacheKey($field)] = true;
            }
        }

        return $this->availableFieldHandleCache[$key] = $handles;
    }

    private function getFormCacheKey(Form $form): int
    {
        return \spl_object_id($form);
    }

    private function getFieldCacheKey(FieldInterface $field): string
    {
        return $field->getHandle();
    }
}
