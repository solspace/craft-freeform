<?php

namespace Solspace\Freeform\Bundles\Persistence\Rules;

use Solspace\Freeform\controllers\api\FormsController;
use Solspace\Freeform\Events\Forms\PersistFormEvent;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Records\Rules\ButtonRuleRecord;
use Solspace\Freeform\Records\Rules\RuleConditionRecord;
use Solspace\Freeform\Records\Rules\RuleRecord;
use yii\base\Event;

class ButtonRulesPersistence extends FeatureBundle
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

        $payload = $event->getPayload()->rules->buttons ?? null;
        if (null === $payload) {
            return;
        }

        $existingRules = $this->getExistingRules($form->getId());
        $usedRuleUids = [];
        foreach ($payload as $data) {
            $button = $data->button;
            $page = $event->getPageRecord($data->page);
            if (!$page) {
                continue;
            }

            if (isset($existingRules[$data->uid])) {
                $record = $existingRules[$data->uid];
                $rule = $record->getRule()->one();
            } else {
                $rule = new RuleRecord();
                $rule->uid = $data->uid;

                $record = new ButtonRuleRecord();
            }

            $rule->combinator = $data->combinator;
            $rule->save();

            $record->id = $rule->id;
            $record->pageId = $page->id;
            $record->button = $button;
            $record->save();

            $usedRuleUids[] = $rule->uid;

            $existingConditions = $rule
                ->getConditions()
                ->indexBy('uid')
                ->all()
            ;

            // TODO: refactor all of the rule persisting logic into one class, and extend what is needed for each type
            $usedConditionUids = [];
            foreach ($data->conditions as $condition) {
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

        $removableRuleUids = array_diff(array_keys($existingRules), $usedRuleUids);
        if ($removableRuleUids) {
            RuleRecord::deleteAll(['uid' => $removableRuleUids]);
        }
    }

    /**
     * @return ButtonRuleRecord[]
     */
    private function getExistingRules(int $formId): array
    {
        return ButtonRuleRecord::getExistingRules($formId);
    }
}
