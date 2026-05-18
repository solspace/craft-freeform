<?php

namespace Solspace\Freeform\Bundles\Rules;

use Solspace\Freeform\Bundles\Integrations\Providers\FormIntegrationsProvider;
use Solspace\Freeform\Bundles\Notifications\Providers\NotificationsProvider;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Cache\Memo;
use Solspace\Freeform\Library\Logging\FreeformLogger;
use Solspace\Freeform\Library\Rules\Condition;
use Solspace\Freeform\Library\Rules\ConditionCollection;
use Solspace\Freeform\Library\Rules\Types\ButtonRule;
use Solspace\Freeform\Library\Rules\Types\FieldRule;
use Solspace\Freeform\Library\Rules\Types\IntegrationRule;
use Solspace\Freeform\Library\Rules\Types\NotificationRule;
use Solspace\Freeform\Library\Rules\Types\PageRule;
use Solspace\Freeform\Library\Rules\Types\SubmitFormRule;
use Solspace\Freeform\Notifications\Types\Conditional\Conditional;
use Solspace\Freeform\Records\Rules\ButtonRuleRecord;
use Solspace\Freeform\Records\Rules\FieldRuleRecord;
use Solspace\Freeform\Records\Rules\IntegrationRuleRecord;
use Solspace\Freeform\Records\Rules\NotificationRuleRecord;
use Solspace\Freeform\Records\Rules\PageRuleRecord;
use Solspace\Freeform\Records\Rules\RuleRecord;
use Solspace\Freeform\Records\Rules\SubmitFormRuleRecord;

class RuleProvider
{
    private const PREFIX_FIELDS = 'fields';
    private const PREFIX_BUTTONS = 'buttons';
    private const PREFIX_PAGES = 'pages';
    private const PREFIX_SUBMIT = 'submit';
    private const PREFIX_NOTIFICATIONS = 'notifications';
    private const PREFIX_NOTIFICATIONS_ARRAY = 'notifications:array';
    private const PREFIX_INTEGRATIONS = 'integrations';
    private const PREFIX_INTEGRATIONS_ARRAY = 'integrations:array';

    private Memo $cache;

    public function __construct(
        private NotificationsProvider $notificationsProvider,
        private FormIntegrationsProvider $integrationsProvider,
    ) {
        $this->cache = new Memo();
    }

    public function getFormRules(?Form $form): array
    {
        if (!$form) {
            return [
                'pages' => [],
                'fields' => [],
                'submitForm' => null,
                'buttons' => [],
            ];
        }

        return [
            'pages' => $this->getPageRules($form),
            'fields' => $this->getFieldRules($form),
            'submitForm' => $this->getSubmitFormRule($form),
            'buttons' => $this->getButtonRules($form),
        ];
    }

    /**
     * @return FieldRule[]
     */
    public function getFieldRules(Form $form): array
    {
        return $this->cache->getOrSet(
            $form->getId(),
            function () use ($form) {
                $records = FieldRuleRecord::getExistingRules($form->getId());

                $rules = [];
                foreach ($records as $fieldRule) {
                    $rules[] = $this->createFieldRuleFromRecord($form, $fieldRule);
                }

                return $rules;
            },
            self::PREFIX_FIELDS,
        );
    }

    public function getFieldRule(Form $form, FieldInterface $field): ?FieldRule
    {
        $rules = $this->getFieldRules($form);
        foreach ($rules as $rule) {
            if ($rule->getField()->getUid() === $field->getUid()) {
                return $rule;
            }
        }

        return null;
    }

    /**
     * @return ButtonRule[]
     */
    public function getButtonRules(Form $form, bool $currentPageOnly = false): array
    {
        $key = $form->getId().':';
        $key .= $currentPageOnly ? 'current' : 'all';

        return $this->cache->getOrSet(
            $key,
            function () use ($form, $currentPageOnly) {
                $rules = ButtonRuleRecord::getExistingRules($form->getId());
                $currentPage = $form->getCurrentPage();

                $array = [];
                foreach ($rules as $uid => $buttonRule) {
                    if ($currentPageOnly && $currentPage->getId() !== $buttonRule->pageId) {
                        continue;
                    }

                    /** @var RuleRecord $rule */
                    $ruleRecord = $buttonRule->rule;
                    $rule = new ButtonRule(
                        $buttonRule->id,
                        $uid,
                        $ruleRecord->combinator,
                        $this->compileConditions($form, $ruleRecord),
                    );

                    $rule->setPage($form->getLayout()->getPages()->get($buttonRule->pageId));
                    $rule->setButton($buttonRule->button);
                    $rule->setDisplay($buttonRule->display);

                    $array[] = $rule;
                }

                return $array;
            },
            self::PREFIX_BUTTONS,
        );
    }

    public function getButtonRule(Form $form, string $button): ?ButtonRule
    {
        $rules = $this->getButtonRules($form, true);
        foreach ($rules as $rule) {
            if ($rule->getButton() === $button) {
                return $rule;
            }
        }

        return null;
    }

    /**
     * @return PageRule[]
     */
    public function getPageRules(Form $form): array
    {
        return $this->cache->getOrSet(
            $form->getId(),
            function () use ($form) {
                $rules = PageRuleRecord::getExistingRules($form->getId());

                $array = [];
                foreach ($rules as $uid => $pageRule) {
                    $ruleRecord = $pageRule->rule;
                    $rule = new PageRule(
                        $pageRule->id,
                        $uid,
                        $ruleRecord->combinator,
                        $this->compileConditions($form, $ruleRecord),
                    );

                    $rule->setPage($form->getLayout()->getPages()->get($pageRule->pageId));

                    $array[] = $rule;
                }

                return $array;
            },
            self::PREFIX_PAGES,
        );
    }

    public function getSubmitFormRule(Form $form): ?SubmitFormRule
    {
        return $this->cache->getOrSet(
            $form->getId(),
            function () use ($form) {
                $submitRule = SubmitFormRuleRecord::getExistingRule($form->getId());
                if ($submitRule) {
                    $ruleRecord = $submitRule->rule;

                    return new SubmitFormRule(
                        $submitRule->id,
                        $ruleRecord->uid,
                        $ruleRecord->combinator,
                        $this->compileConditions($form, $ruleRecord),
                    );
                }

                return null;
            },
            self::PREFIX_SUBMIT,
        );
    }

    /**
     * @return NotificationRule[]
     */
    public function getNotificationRules(Form $form): array
    {
        return $this->cache->getOrSet(
            $form->getId(),
            function () use ($form) {
                $rules = NotificationRuleRecord::getExistingRules($form->getId());
                $notifications = $this->notificationsProvider->getByFormAndClass(
                    $form,
                    Conditional::class,
                );

                $array = [];
                foreach ($rules as $uid => $notificationRule) {
                    $ruleRecord = $notificationRule->rule;
                    $rule = new NotificationRule(
                        $notificationRule->id,
                        $uid,
                        $ruleRecord->combinator,
                        $this->compileConditions($form, $ruleRecord),
                    );

                    $rule->setSend($notificationRule->send);

                    $notificationInstance = null;
                    foreach ($notifications as $notification) {
                        if ($notification->getId() === $notificationRule->notificationId) {
                            $notificationInstance = $notification;

                            break;
                        }
                    }

                    if (!$notificationInstance) {
                        continue;
                    }

                    $rule->setNotification($notificationInstance);

                    $array[] = $rule;
                }

                return $array;
            },
            self::PREFIX_NOTIFICATIONS,
        );
    }

    /**
     * @return IntegrationRule[]
     */
    public function getIntegrationRules(Form $form): array
    {
        return $this->cache->getOrSet(
            $form->getId(),
            function () use ($form) {
                $rules = IntegrationRuleRecord::getExistingRules($form->getId());
                $integrations = $this->integrationsProvider->getForForm($form);

                $array = [];
                foreach ($rules as $uid => $integrationRule) {
                    $ruleRecord = $integrationRule->rule;
                    $rule = new IntegrationRule(
                        $integrationRule->id,
                        $uid,
                        $ruleRecord->combinator,
                        $this->compileConditions($form, $ruleRecord),
                    );

                    $rule->setPush($integrationRule->push);

                    $integrationInstance = null;
                    foreach ($integrations as $integration) {
                        if ($integration->getInstanceId() === $integrationRule->integrationId) {
                            $integrationInstance = $integration;

                            break;
                        }
                    }

                    if (!$integrationInstance) {
                        continue;
                    }

                    $rule->setIntegration($integrationInstance);

                    $array[] = $rule;
                }

                return $array;
            },
            self::PREFIX_INTEGRATIONS,
        );
    }

    public function getFormNotificationRules(?Form $form): array
    {
        return $this->cache->getOrSet(
            $form->getId(),
            function () use ($form) {
                if (!$form) {
                    return [];
                }

                return $this->getNotificationRuleArray($form);
            },
            self::PREFIX_NOTIFICATIONS_ARRAY,
        );
    }

    public function getFormIntegrationRules(?Form $form): array
    {
        return $this->cache->getOrSet(
            $form->getId(),
            function () use ($form) {
                if (!$form) {
                    return [];
                }

                return $this->getIntegrationRuleArray($form);
            },
            self::PREFIX_INTEGRATIONS_ARRAY,
        );
    }

    private function createFieldRuleFromRecord(Form $form, FieldRuleRecord $record): FieldRule
    {
        $ruleRecord = $record->rule;

        $rule = new FieldRule(
            $record->id,
            $ruleRecord->uid,
            $ruleRecord->combinator,
            $this->compileConditions($form, $ruleRecord),
        );

        $rule->setDisplay($record->display);
        $rule->setField(
            $form->get($record->field->uid)
        );

        return $rule;
    }

    private function getNotificationRuleArray(Form $form): array
    {
        $rules = NotificationRuleRecord::getExistingRules($form->getId());

        $array = [];
        foreach ($rules as $uid => $notificationRule) {
            $rule = $notificationRule->rule;

            $conditions = [];

            foreach ($rule->conditions as $condition) {
                $conditions[] = [
                    'uid' => $condition->uid,
                    'field' => $condition->field->uid,
                    'operator' => $condition->operator,
                    'value' => $condition->value,
                ];
            }

            $array[] = [
                'uid' => $uid,
                'notification' => $notificationRule->notification->uid,
                'enabled' => true,
                'send' => $notificationRule->send,
                'combinator' => $rule->combinator,
                'conditions' => $conditions,
            ];
        }

        return $array;
    }

    private function getIntegrationRuleArray(Form $form): array
    {
        $rules = IntegrationRuleRecord::getExistingRules($form->getId());

        $array = [];
        foreach ($rules as $uid => $integrationRule) {
            $rule = $integrationRule->rule;

            $conditions = [];

            foreach ($rule->conditions as $condition) {
                $conditions[] = [
                    'uid' => $condition->uid,
                    'field' => $condition->field->uid,
                    'operator' => $condition->operator,
                    'value' => $condition->value,
                ];
            }

            $array[] = [
                'uid' => $uid,
                'integration' => $integrationRule->integration->uid,
                'enabled' => true,
                'push' => $integrationRule->push,
                'combinator' => $rule->combinator,
                'conditions' => $conditions,
            ];
        }

        return $array;
    }

    private function compileConditions(Form $form, RuleRecord $ruleRecord): ConditionCollection
    {
        $conditionCollection = new ConditionCollection();
        $conditionRuleLogger = Freeform::getInstance()->logger->getLogger(FreeformLogger::CONDITIONAL_RULE);

        foreach ($ruleRecord->conditions as $condition) {
            $fieldRecord = $condition->field;
            if (!$fieldRecord) {
                $conditionRuleLogger->error(
                    'Conditional field was not found',
                    [
                        'condition' => $condition,
                        'form' => $form->getHandle(),
                    ]
                );

                continue;
            }

            $field = $form->get($fieldRecord->uid);
            if (!$field instanceof FieldInterface) {
                $conditionRuleLogger->error(
                    'Form field was not an instance of FieldInterface',
                    [
                        'field' => [
                            'id' => $fieldRecord->id,
                            'handle' => $fieldRecord->handle,
                        ],
                        'form' => $form->getHandle(),
                    ]
                );

                continue;
            }

            $conditionCollection->add(
                new Condition(
                    $condition->uid,
                    $field,
                    $condition->operator,
                    $condition->value
                )
            );
        }

        return $conditionCollection;
    }
}
