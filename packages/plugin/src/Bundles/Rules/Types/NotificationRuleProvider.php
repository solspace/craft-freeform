<?php

namespace Solspace\Freeform\Bundles\Rules\Types;

use Solspace\Freeform\Attributes\Property\Implementations\Field\FieldTransformer;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Rules\Condition;
use Solspace\Freeform\Library\Rules\ConditionCollection;
use Solspace\Freeform\Library\Rules\Types\NotificationRule;
use Solspace\Freeform\Records\Form\FormNotificationRecord;
use Solspace\Freeform\Records\Rules\NotificationRuleRecord;
use Solspace\Freeform\Records\Rules\RuleRecord;

class NotificationRuleProvider
{
    private ?array $cache = null;

    public function __construct(
        private FieldTransformer $fieldTransformer
    ) {}

    public function getByForm(Form $form): array
    {
        $rules = $this->getAllNotifications();
        $rules = array_filter(
            $rules,
            fn (NotificationRuleRecord $record) => $record->getNotification()->one()->formId === $form->getId()
        );

        $notificationRules = [];
        foreach ($rules as $rule) {
            $notificationRules[] = $this->createRuleFromRecord($rule);
        }

        return $notificationRules;
    }

    public function getByUid(string $uid): ?NotificationRule
    {
        $record = $this->getAllNotifications()[$uid] ?? null;
        if (!$record) {
            return null;
        }

        return $this->createRuleFromRecord($record);
    }

    private function getAllNotifications(): array
    {
        if (null === $this->cache) {
            $items = NotificationRuleRecord::find()
                ->select(['nr.*'])
                ->from(NotificationRuleRecord::TABLE.' nr')
                ->innerJoin(RuleRecord::TABLE.' r', '[[nr.id]] = [[r.id]]')
                ->innerJoin(FormNotificationRecord::TABLE.' fn', '[[nr.notificationId]] = [[fn.id]]')
                ->with('rule', 'conditions', 'notification')
                ->all()
            ;

            $this->cache = [];
            foreach ($items as $item) {
                $this->cache[$item->getRule()->one()->uid] = $item;
            }
        }

        return $this->cache;
    }

    private function createRuleFromRecord(NotificationRuleRecord $record): NotificationRule
    {
        $conditions = new ConditionCollection();
        foreach ($record->getConditions()->all() as $conditionRecord) {
            $field = $this->fieldTransformer->transform($conditionRecord->getField()->one()->uid);
            $condition = new Condition(
                $conditionRecord->uid,
                $field,
                $conditionRecord->operator,
                $conditionRecord->value
            );

            $conditions->add($condition);
        }

        $ruleRecord = $record->getRule()->one();

        $rule = new NotificationRule(
            $ruleRecord->id,
            $ruleRecord->uid,
            $ruleRecord->combinator,
            $conditions,
        );

        // $rule->setNotification($record->getNotification()->one());
        $rule->setSend($record->send);

        return $rule;
    }
}
