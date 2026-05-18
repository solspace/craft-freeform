<?php

namespace Solspace\Freeform\Bundles\Rules\Types;

use Solspace\Freeform\Attributes\Property\Implementations\Field\FieldTransformer;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Cache\Memo;
use Solspace\Freeform\Library\Rules\Condition;
use Solspace\Freeform\Library\Rules\ConditionCollection;
use Solspace\Freeform\Library\Rules\Types\NotificationRule;
use Solspace\Freeform\Records\Form\FormNotificationRecord;
use Solspace\Freeform\Records\Rules\NotificationRuleRecord;
use Solspace\Freeform\Records\Rules\RuleRecord;

class NotificationRuleProvider
{
    private Memo $cache;
    private array $formCache = [];

    public function __construct(
        private FieldTransformer $fieldTransformer
    ) {
        $this->cache = new Memo();
    }

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
        return $this->cache->getOrSet(
            'all',
            static function () {
                $items = NotificationRuleRecord::find()
                    ->select(['nr.*'])
                    ->from(NotificationRuleRecord::TABLE.' nr')
                    ->innerJoin(RuleRecord::TABLE.' r', '[[nr.id]] = [[r.id]]')
                    ->innerJoin(FormNotificationRecord::TABLE.' fn', '[[nr.notificationId]] = [[fn.id]]')
                    ->with('conditions.field', 'notification')
                    ->all()
                ;

                $data = [];
                foreach ($items as $item) {
                    $data[$item->rule->uid] = $item;
                }

                return $data;
            },
        );
    }

    private function getNotificationsByForm(Form $form): array
    {
        return $this->cache->getOrSet(
            $form->getId(),
            static function () use ($form) {
                $formId = $form->getId();

                /** @var NotificationRuleRecord[] $items */
                $items = NotificationRuleRecord::find()
                    ->select(['nr.*'])
                    ->from(NotificationRuleRecord::TABLE.' nr')
                    ->innerJoin(RuleRecord::TABLE.' r', '[[nr.id]] = [[r.id]]')
                    ->innerJoin(FormNotificationRecord::TABLE.' fn', '[[nr.notificationId]] = [[fn.id]]')
                    ->where(['fn.formId' => $formId])
                    ->with('conditions.field', 'notification')
                    ->all()
                ;

                $data = [];
                foreach ($items as $item) {
                    $data[$item->rule->uid] = $item;
                }

                return $data;
            },
        );
    }

    private function createRuleFromRecord(NotificationRuleRecord $record, ?Form $form = null): NotificationRule
    {
        $conditions = new ConditionCollection();
        foreach ($record->conditions as $conditionRecord) {
            $field = $this->fieldTransformer->transform($conditionRecord->field->uid, $form);
            $condition = new Condition(
                $conditionRecord->uid,
                $field,
                $conditionRecord->operator,
                $conditionRecord->value
            );

            $conditions->add($condition);
        }

        $ruleRecord = $record->rule;

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
