<?php

namespace Solspace\Freeform\Bundles\Persistence\Rules;

use craft\helpers\Db;
use craft\helpers\StringHelper;
use Solspace\Freeform\controllers\api\FormsController;
use Solspace\Freeform\Events\Forms\PersistFormEvent;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Records\Rules\IntegrationRuleRecord;
use Solspace\Freeform\Records\Rules\RuleConditionRecord;
use Solspace\Freeform\Records\Rules\RuleRecord;
use yii\base\Event;

class IntegrationRulesPersistence extends FeatureBundle
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

        $payload = $event->getPayload()->rules->integrations ?? null;
        if (null === $payload) {
            return;
        }

        $existingRules = $this->getExistingRules($form->getId());
        $usedRuleUids = [];
        foreach ($payload as $data) {
            $integration = $event->getIntegrationRecord($data->integration);
            if (!$integration) {
                continue;
            }

            if (isset($existingRules[$data->uid])) {
                $record = $existingRules[$data->uid];
                $rule = $record->rule;
            } else {
                $rule = new RuleRecord();
                $rule->uid = $data->uid;

                $record = new IntegrationRuleRecord();
            }

            $rule->combinator = $data->combinator;
            $rule->save();

            $record->id = $rule->id;
            $record->integrationId = $integration->id;
            $record->push = $data->push;
            $record->save();

            $usedRuleUids[] = $rule->uid;

            $existingConditions = $rule
                ->getConditions()
                ->indexBy('uid')
                ->all()
            ;

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
                    $conditionRecord->uid = StringHelper::UUID();
                    $conditionRecord->dateCreated = Db::prepareDateForDb(new \DateTime());
                }

                $conditionRecord->fieldId = $conditionField->id;
                $conditionRecord->operator = $condition->operator;
                $conditionRecord->value = $condition->value;
                $conditionRecord->dateUpdated = Db::prepareDateForDb(new \DateTime());
                $conditionRecord->save();

                $usedConditionUids[] = $conditionRecord->uid;
            }

            $removableConditionUids = array_diff(array_keys($existingConditions), $usedConditionUids);
            if ($removableConditionUids) {
                RuleConditionRecord::deleteAll(['uid' => $removableConditionUids, 'ruleId' => $rule->id]);
            }
        }

        $removableRuleUids = array_diff(array_keys($existingRules), $usedRuleUids);
        if ($removableRuleUids) {
            RuleRecord::deleteAll(['uid' => $removableRuleUids]);
        }
    }

    /**
     * @return IntegrationRuleRecord[]
     */
    private function getExistingRules(int $formId): array
    {
        return IntegrationRuleRecord::getExistingRules($formId);
    }
}
