<?php

namespace Solspace\Freeform\Bundles\Persistence\Rules;

use Solspace\Freeform\controllers\api\FormsController;
use Solspace\Freeform\Events\Forms\PersistFormEvent;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Records\Rules\RuleConditionRecord;
use Solspace\Freeform\Records\Rules\RuleRecord;
use Solspace\Freeform\Records\Rules\SubmitFormRuleRecord;
use yii\base\Event;

class SubmitFormRulesPersistence extends FeatureBundle
{
    public function __construct()
    {
        Event::on(
            FormsController::class,
            FormsController::EVENT_UPSERT_FORM,
            [$this, 'handleRuleSave']
        );
    }

    public static function getPriority(): int
    {
        return 500;
    }

    public function handleRuleSave(PersistFormEvent $event): void
    {
        $form = $event->getForm();
        if (!$form) {
            return;
        }

        $payload = $event->getPayload()->rules->submitForm ?? null;

        $record = $this->getExistingRule($form->getId());
        if (!$payload) {
            if ($record) {
                $record->delete();

                return;
            }
        }

        if (!$record) {
            $record = new SubmitFormRuleRecord();
            $record->formId = $form->getId();

            $rule = new RuleRecord();
            $rule->uid = $payload->uid;
        } else {
            $rule = $record->getRule()->one();
        }

        $rule->combinator = $payload->combinator;
        $rule->save();

        $record->id = $rule->id;
        $record->formId = $form->getId();
        $record->save();

        $existingConditions = $rule
            ->getConditions()
            ->indexBy('uid')
            ->all()
        ;

        $usedConditionUids = [];
        foreach ($payload->conditions as $condition) {
            $conditionField = $event->getFieldRecord($condition->field);
            if (!$conditionField) {
                continue;
            }

            $conditionRecord = $existingConditions[$condition->uid] ?? null;
            if (null === $conditionRecord) {
                $conditionRecord = new RuleConditionRecord();
                $conditionRecord->ruleId = $rule->id;
            }

            $conditionRecord->fieldId = $conditionField->id;
            $conditionRecord->operator = $condition->operator;
            $conditionRecord->value = $condition->value;
            $conditionRecord->save();

            $usedConditionUids[] = $conditionRecord->uid;
        }

        $removableConditionUids = array_diff(array_keys($existingConditions), $usedConditionUids);
        if ($removableConditionUids) {
            RuleConditionRecord::deleteAll(['uid' => $removableConditionUids]);
        }
    }

    private function getExistingRule(int $formId): ?SubmitFormRuleRecord
    {
        return SubmitFormRuleRecord::getExistingRule($formId);
    }
}
