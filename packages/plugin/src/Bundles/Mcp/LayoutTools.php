<?php

namespace Solspace\Freeform\Bundles\Mcp;

use craft\helpers\StringHelper;
use craft\mcp\attributes\RequiresPermission;
use Mcp\Capability\Attribute\McpTool;
use Mcp\Capability\Attribute\Schema;
use Mcp\Exception\ToolCallException;
use Mcp\Schema\ToolAnnotations;
use Solspace\Freeform\Bundles\Persistence\Duplication\FormDuplicator;
use Solspace\Freeform\Fields\Implementations\Pro\GroupField;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Helpers\JsonHelper;
use Solspace\Freeform\Library\Helpers\PermissionHelper;
use Solspace\Freeform\Library\Rules\Condition;
use Solspace\Freeform\Records\Form\FormFieldRecord;
use Solspace\Freeform\Records\Form\FormLayoutRecord;
use Solspace\Freeform\Records\Form\FormPageRecord;
use Solspace\Freeform\Records\Form\FormRowRecord;
use Solspace\Freeform\Records\FormRecord;
use Solspace\Freeform\Records\Rules\FieldRuleRecord;
use Solspace\Freeform\Records\Rules\RuleConditionRecord;
use Solspace\Freeform\Records\Rules\RuleRecord;

final class LayoutTools
{
    private const OPERATORS = [
        Condition::TYPE_EQUALS,
        Condition::TYPE_NOT_EQUALS,
        Condition::TYPE_CONTAINS,
        Condition::TYPE_NOT_CONTAINS,
        Condition::TYPE_IS_EMPTY,
        Condition::TYPE_IS_NOT_EMPTY,
    ];

    #[McpTool(name: 'freeform.forms.duplicate', description: 'Duplicate a manageable form and its layout and rules for testing. The copy has notifications, delivery integrations and public HTML embeds disabled.', annotations: new ToolAnnotations(destructiveHint: false))]
    #[RequiresPermission('accessCp')]
    #[RequiresPermission('accessPlugin-freeform')]
    #[RequiresPermission(Freeform::PERMISSION_FORMS_CREATE)]
    public function duplicate(string $form, string $site, string $name, string $handle): array
    {
        return Access::run(Freeform::PERMISSION_FORMS_CREATE, static function () use ($form, $site, $name, $handle): array {
            if (!PermissionHelper::checkPermission(Freeform::PERMISSION_FORMS_ACCESS) || Freeform::getInstance()->edition()->isBelow(Freeform::EDITION_LITE)) {
                throw new ToolCallException('Duplicating forms requires form access and Freeform Lite or Pro.');
            }
            Access::requireEditorOption('layout.fields');
            Access::requireEditorOption('settings.tab.general.handle');
            $site = Access::site($site);
            $source = Access::form($form, $site);
            $name = Access::text($name, 100, true);
            if (!preg_match('/^[a-zA-Z][a-zA-Z0-9_]{0,99}$/D', $handle)) {
                throw new ToolCallException('Supply a handle containing letters, numbers and underscores, beginning with a letter.');
            }

            return Access::withLayoutLock(0, static function () use ($source, $form, $site, $name, $handle): array {
                if (FormRecord::find()->where(['handle' => $handle])->exists()) {
                    throw new ToolCallException('The form handle already exists.');
                }

                return Access::withLayoutLock($source->getId(), static function () use ($source, $form, $site, $name, $handle): array {
                    $fresh = Access::form($form, $site);
                    if ($source->getId() !== $fresh->getId()) {
                        throw new ToolCallException('The source form changed. Read it again before duplicating.');
                    }
                    Access::requireAllFormSites($fresh);
                    $id = \Craft::$container->get(FormDuplicator::class)->copyForTesting($fresh->getId(), $name, $handle);
                    if (!$id) {
                        throw new ToolCallException('The form could not be duplicated.');
                    }

                    return ['form' => $handle, 'name' => $name, 'source' => $form, 'deliveryEnabled' => false];
                });
            });
        });
    }

    /** @param int $page One-based page number from freeform.forms.get. */
    #[McpTool(name: 'freeform.pages.update', description: 'Update the label or an existing button label on a form page. Omitted values stay the same.', annotations: new ToolAnnotations(destructiveHint: false, idempotentHint: true))]
    #[RequiresPermission('accessCp')]
    #[RequiresPermission('accessPlugin-freeform')]
    #[RequiresPermission(Freeform::PERMISSION_FORMS_ACCESS)]
    public function updatePage(string $form, string $site, int $page, ?string $label = null, ?string $submitLabel = null, ?string $backLabel = null, ?string $saveLabel = null): array
    {
        return Access::editForm($form, $site, static function (Form $target) use ($page, $label, $submitLabel, $backLabel, $saveLabel): array {
            $record = self::page($target, $page);
            if (null !== $label) {
                Access::requireEditorOption('layout.multiPageForms');
                $record->label = Access::text($label, 100, true);
            }

            $buttons = array_filter(compact('submitLabel', 'backLabel', 'saveLabel'), static fn ($text) => null !== $text);
            if ($buttons) {
                Access::requireEditorOption('layout.buttons');
                $metadata = JsonHelper::decode($record->metadata) ?: new \stdClass();
                $metadata->buttons ??= new \stdClass();
                foreach ($buttons as $key => $text) {
                    $metadata->buttons->{$key} = Access::text($text, 100, true);
                }
                $record->metadata = $metadata;
            }
            if ((null === $label && !$buttons) || !$record->save()) {
                throw new ToolCallException('Supply a valid page or button label to save.');
            }

            return ['page' => $page, 'label' => $record->label, 'updatedButtons' => $buttons];
        });
    }

    #[McpTool(name: 'freeform.pages.add', description: 'Append an empty page to a form. Use freeform.fields.add or freeform.fields.move to populate it.', annotations: new ToolAnnotations(destructiveHint: false))]
    #[RequiresPermission('accessCp')]
    #[RequiresPermission('accessPlugin-freeform')]
    #[RequiresPermission(Freeform::PERMISSION_FORMS_ACCESS)]
    public function addPage(string $form, string $site, string $label): array
    {
        return Access::editForm($form, $site, static function (Form $target) use ($label): array {
            Access::requireEditorOption('layout.multiPageForms');
            if (Freeform::getInstance()->edition()->isBelow(Freeform::EDITION_LITE)) {
                throw new ToolCallException('Adding pages requires Freeform Lite or Pro.');
            }
            $label = Access::text($label, 100, true);
            $number = $target->getPages()->count() + 1;
            $last = FormPageRecord::find()->where(['formId' => $target->getId()])->orderBy(['order' => \SORT_DESC])->one();
            $layout = new FormLayoutRecord();
            $layout->formId = $target->getId();
            $layout->uid = StringHelper::UUID();
            if (!$last || !$layout->save()) {
                throw new ToolCallException('The new page layout could not be created.');
            }
            $record = new FormPageRecord();
            $record->uid = StringHelper::UUID();
            $record->formId = $target->getId();
            $record->layoutId = $layout->id;
            $record->order = $last->order + 1;
            $record->label = $label;
            $record->metadata = ['buttons' => ['layout' => 'back|submit', 'submitLabel' => Freeform::t('Submit'), 'back' => true, 'save' => false]];
            if (!$record->save()) {
                throw new ToolCallException('The new page could not be saved.');
            }

            return ['page' => $number, 'label' => $label];
        });
    }

    /**
     * @param int      $page     one-based destination page number
     * @param null|int $row      One-based destination row from freeform.forms.get. Omit to append a new row.
     * @param null|int $position One-based position in the destination row. Defaults to the end.
     */
    #[McpTool(name: 'freeform.fields.move', description: 'Move a standard field within or between rows and pages, keeping the same field and submission data. Read current row order with freeform.forms.get first.', annotations: new ToolAnnotations(destructiveHint: false))]
    #[RequiresPermission('accessCp')]
    #[RequiresPermission('accessPlugin-freeform')]
    #[RequiresPermission(Freeform::PERMISSION_FORMS_ACCESS)]
    public function moveField(string $form, string $site, string $field, int $page, ?int $row = null, ?int $position = null): array
    {
        return Access::editForm($form, $site, static function (Form $target) use ($field, $page, $row, $position): array {
            $record = self::field($target, $field);
            $oldRow = $record->row;
            $destination = self::page($target, $page);
            if ((int) $oldRow->layoutId !== (int) $destination->layoutId) {
                Access::requireEditorOption('layout.multiPageForms');
                if (FieldRuleRecord::find()->where(['fieldId' => $record->id])->exists()
                    || RuleConditionRecord::find()->where(['fieldId' => $record->id])->exists()) {
                    throw new ToolCallException('This field is involved in conditional rules. Review the rules in Craft before moving it to another page.');
                }
            }

            $rows = FormRowRecord::find()->where(['layoutId' => $destination->layoutId, 'formId' => $target->getId()])
                ->orderBy(['order' => \SORT_ASC, 'id' => \SORT_ASC])->all()
            ;
            if (null === $row) {
                $newRow = new FormRowRecord();
                $newRow->formId = $target->getId();
                $newRow->layoutId = $destination->layoutId;
                $newRow->order = $rows ? end($rows)->order + 1 : 0;
                $newRow->uid = StringHelper::UUID();
                if (!$newRow->save()) {
                    throw new ToolCallException('The new row could not be saved.');
                }
            } else {
                $newRow = $rows[$row - 1] ?? throw new ToolCallException('Choose an existing row or omit the row to create one.');
            }

            $fields = FormFieldRecord::find()->where(['rowId' => $newRow->id])->andWhere(['<>', 'id', $record->id])
                ->orderBy(['order' => \SORT_ASC, 'id' => \SORT_ASC])->all()
            ;
            $position ??= \count($fields) + 1;
            if (\count($fields) >= 4 || $position < 1 || $position > \count($fields) + 1) {
                throw new ToolCallException('Choose an available position in a row with room for up to four fields.');
            }
            $record->rowId = $newRow->id;
            array_splice($fields, $position - 1, 0, [$record]);
            foreach ($fields as $index => $item) {
                $item->order = $index;
                if (!$item->save(false, ['rowId', 'order'])) {
                    throw new ToolCallException('The layout could not be saved.');
                }
            }
            if ($oldRow->id !== $newRow->id && !FormFieldRecord::find()->where(['rowId' => $oldRow->id])->exists()) {
                $oldRow->delete();
            }

            return ['field' => $field, 'page' => $page, 'position' => $position];
        });
    }

    /** @param list<array{field:string, operator:string, value?:string}> $conditions Conditions against fields on the same or an earlier page. */
    #[McpTool(name: 'freeform.rules.set-field', description: 'Set a field’s show or hide rule using all or any of the conditions. Requires Freeform Pro.', annotations: new ToolAnnotations(destructiveHint: false, idempotentHint: true))]
    #[RequiresPermission('accessCp')]
    #[RequiresPermission('accessPlugin-freeform')]
    #[RequiresPermission(Freeform::PERMISSION_FORMS_ACCESS)]
    public function setFieldRule(
        string $form,
        string $site,
        string $field,
        #[Schema(enum: ['show', 'hide'])]
        string $display,
        #[Schema(minItems: 1, maxItems: 10, items: ['type' => 'object', 'required' => ['field', 'operator'], 'additionalProperties' => false, 'properties' => [
            'field' => ['type' => 'string'],
            'operator' => ['type' => 'string', 'enum' => self::OPERATORS],
            'value' => ['type' => 'string'],
        ]])]
        array $conditions,
        #[Schema(enum: ['and', 'or'])]
        string $combinator = 'and',
    ): array {
        return Access::editForm($form, $site, static function (Form $target) use ($field, $display, $conditions, $combinator): array {
            Access::requireEditorOption('rules.tab.fields');
            if (!Freeform::getInstance()->edition()->is(Freeform::EDITION_PRO)) {
                throw new ToolCallException('Field rules require Freeform Pro.');
            }
            if (!\in_array($display, ['show', 'hide'], true) || !\in_array($combinator, ['and', 'or'], true)
                || !$conditions || !array_is_list($conditions) || \count($conditions) > 10) {
                throw new ToolCallException('Supply between one and ten conditions and choose valid rule options.');
            }

            $fieldRecord = self::field($target, $field);
            $pages = FormPageRecord::find()->where(['formId' => $target->getId()])->indexBy('layoutId')->all();
            $fieldPage = $pages[$fieldRecord->row->layoutId] ?? null;
            $data = [];
            foreach ($conditions as $condition) {
                if (!\is_array($condition) || !\is_string($condition['field'] ?? null)
                    || !\in_array($condition['operator'] ?? null, self::OPERATORS, true)) {
                    throw new ToolCallException('Choose an existing condition field and a supported operator.');
                }
                $source = self::field($target, $condition['field']);
                $sourcePage = $pages[$source->row->layoutId] ?? null;
                if (!$fieldPage || !$sourcePage || $sourcePage->order > $fieldPage->order || self::dependsOn((int) $source->id, (int) $fieldRecord->id)) {
                    throw new ToolCallException('Use fields on the same or an earlier page and avoid circular rules.');
                }
                $operator = $condition['operator'];
                $emptyCheck = \in_array($operator, [Condition::TYPE_IS_EMPTY, Condition::TYPE_IS_NOT_EMPTY], true);
                $data[] = [(int) $source->id, $operator, $emptyCheck ? '' : Access::text($condition['value'] ?? null, 500, true)];
            }

            $existing = FieldRuleRecord::getExistingRule($fieldRecord->id);
            $rule = $existing?->rule ?? new RuleRecord();
            $rule->uid ??= StringHelper::UUID();
            $rule->combinator = $combinator;
            $link = $existing ?? new FieldRuleRecord();
            if (!$rule->save()) {
                throw new ToolCallException('The rule could not be saved.');
            }
            $link->id = $rule->id;
            $link->uid ??= StringHelper::UUID();
            $link->fieldId = $fieldRecord->id;
            $link->display = $display;
            if (!$link->save()) {
                throw new ToolCallException('The rule could not be attached to the field.');
            }

            RuleConditionRecord::deleteAll(['ruleId' => $rule->id]);
            foreach ($data as [$sourceId, $operator, $value]) {
                $record = new RuleConditionRecord();
                $record->ruleId = $rule->id;
                $record->fieldId = $sourceId;
                $record->operator = $operator;
                $record->value = $value;
                $record->uid = StringHelper::UUID();
                if (!$record->save()) {
                    throw new ToolCallException('The rule conditions could not be saved.');
                }
            }

            return ['field' => $field, 'display' => $display, 'combinator' => $combinator, 'conditions' => $conditions];
        });
    }

    private static function page(Form $form, int $number): FormPageRecord
    {
        $page = $number > 0 ? $form->getPages()->getByIndex($number - 1) : null;
        $record = $page ? FormPageRecord::findOne(['formId' => $form->getId(), 'uid' => $page->getUid()]) : null;

        return $record ?? throw new ToolCallException('Choose an existing page number from freeform.forms.get.');
    }

    private static function field(Form $form, string $handle): FormFieldRecord
    {
        Access::requireEditorOption('layout.fields');
        $field = $form->getLayout()->getFields()->get($handle);
        if (!$field || $field->getParentField() || $field instanceof GroupField) {
            throw new ToolCallException('Choose a top-level field. Use the Craft builder to edit nested fields or groups.');
        }
        Access::requireEditorOption('layout.fieldTypes', $field::class);

        return FormFieldRecord::findOne(['formId' => $form->getId(), 'uid' => $field->getUid()])
            ?? throw new ToolCallException('The field is unavailable.');
    }

    private static function dependsOn(int $source, int $target): bool
    {
        $pending = [$source];
        $visited = [];
        while ($pending) {
            $field = array_pop($pending);
            if ($field === $target) {
                return true;
            }
            if (isset($visited[$field])) {
                continue;
            }
            $visited[$field] = true;
            $rule = FieldRuleRecord::getExistingRule($field);
            foreach ($rule?->rule?->conditions ?? [] as $condition) {
                $pending[] = (int) $condition->fieldId;
            }
        }

        return false;
    }
}
