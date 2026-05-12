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
    private array $formCache = [];

    public function __construct(
        private FieldTransformer $fieldTransformer
    ) {}

    public function getByForm(Form $form): array
    {
        $rules = $this->getNotificationsByForm($form);

        $notificationRules = [];
        foreach ($rules as $rule) {
            $notificationRules[] = $this->createRuleFromRecord($rule, $form);
        }

        return $notificationRules;
    }

    public function getByUid(string $uid, ?Form $form = null): ?NotificationRule
    {
        $record = $form
            ? ($this->getNotificationsByForm($form)[$uid] ?? null)
            : ($this->getAllNotifications()[$uid] ?? null);

        if (!$record) {
            return null;
        }

        return $this->createRuleFromRecord($record, $form);
    }

    private function getAllNotifications(): array
    {
        if (null === $this->cache) {
            $items = NotificationRuleRecord::find()
                ->select(['nr.*'])
                ->from(NotificationRuleRecord::TABLE.' nr')
                ->innerJoin(RuleRecord::TABLE.' r', '[[nr.id]] = [[r.id]]')
                ->innerJoin(FormNotificationRecord::TABLE.' fn', '[[nr.notificationId]] = [[fn.id]]')
                ->with('rule', 'conditions.field', 'notification')
                ->all()
            ;

            $this->cache = [];
            foreach ($items as $item) {
                $this->cache[$item->getRule()->one()->uid] = $item;
            }
        }

        return $this->cache;
    }

    private function getNotificationsByForm(Form $form): array
    {
        $formId = $form->getId();
        if (!isset($this->formCache[$formId])) {
            $items = NotificationRuleRecord::find()
                ->select(['nr.*'])
                ->from(NotificationRuleRecord::TABLE.' nr')
                ->innerJoin(RuleRecord::TABLE.' r', '[[nr.id]] = [[r.id]]')
                ->innerJoin(FormNotificationRecord::TABLE.' fn', '[[nr.notificationId]] = [[fn.id]]')
                ->where(['fn.formId' => $formId])
                ->with('rule', 'conditions.field', 'notification')
                ->all()
            ;

            $this->formCache[$formId] = [];
            foreach ($items as $item) {
                $this->formCache[$formId][$item->getRule()->one()->uid] = $item;
            }
        }

        return $this->formCache[$formId];
    }

    private function createRuleFromRecord(NotificationRuleRecord $record, ?Form $form = null): NotificationRule
    {
        $conditions = new ConditionCollection();
        foreach ($record->getConditions()->all() as $conditionRecord) {
            $field = $this->fieldTransformer->transform($conditionRecord->getField()->one()->uid, $form);
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
