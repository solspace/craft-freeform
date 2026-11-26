<?php

namespace Solspace\Freeform\Bundles\Mcp;

use craft\db\Query;
use craft\helpers\UrlHelper;
use craft\models\Site;
use Mcp\Exception\ToolCallException;
use Solspace\Freeform\Bundles\Attributes\Property\PropertyProvider;
use Solspace\Freeform\Bundles\Form\Limiting\DuplicateCheckScope;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Interfaces\EncryptionInterface;
use Solspace\Freeform\Fields\Interfaces\GeneratedOptionsInterface;
use Solspace\Freeform\Fields\Interfaces\MultiValueInterface;
use Solspace\Freeform\Fields\Properties\Options\Custom\Custom;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\DataObjects\FormWizard\PresetCatalog;
use Solspace\Freeform\Library\Helpers\JsonHelper;
use Solspace\Freeform\Library\Helpers\PermissionHelper;
use Solspace\Freeform\Records\Form\FormFieldRecord;
use Solspace\Freeform\Records\Form\FormNotificationRecord;
use Solspace\Freeform\Records\FormRecord;
use Solspace\Freeform\Records\Rules\FieldRuleRecord;
use Solspace\Freeform\Records\Rules\RuleConditionRecord;
use Solspace\Freeform\Services\FormWizardService;

final class FieldChange
{
    public const OPERATIONS = ['remove-choices', 'switch-source', 'change-type'];
    public const FIELD_TYPES = ['text', 'textarea', 'email', 'number', 'website'];

    private const TTL = 600;
    private const CACHE_PREFIX = 'freeform.mcp.field-change.';

    public static function request(string $form, string $site, string $field, string $operation, array $input): array
    {
        return self::withTarget($form, $site, static function (Form $target, Site $siteModel) use ($form, $site, $field, $operation, $input): array {
            [$impact, $revision] = self::inspect($target, $siteModel, $field, $operation, $input);
            $impact['consequences'] = array_map(Freeform::t(...), $impact['consequences']);
            if (isset($impact['blockedBy'])) {
                $impact['blockedBy'] = Freeform::t($impact['blockedBy']);

                return ['status' => 'blocked'] + $impact;
            }

            $token = bin2hex(random_bytes(32));
            $userId = \Craft::$app->getUser()->getId();
            $confirmationRequired = SecurityPolicy::requiresDestructiveConfirmation();
            $review = compact('form', 'site', 'field', 'operation', 'input', 'revision', 'userId', 'confirmationRequired');
            if (!\Craft::$app->getCache()->set(self::CACHE_PREFIX.$token, $review, self::TTL)) {
                throw new ToolCallException('Could not create the private Craft review link.');
            }

            return $impact + [
                'status' => $confirmationRequired ? 'confirmation_required' : 'ready_for_change',
                'confirmationRequired' => $confirmationRequired,
                'reviewUrl' => UrlHelper::cpUrl('freeform/forms/mcp-field-change', ['review' => $token]),
                'reviewLabel' => $confirmationRequired ? '⚠️ '.Freeform::t('Approval required in Craft') : Freeform::t('Review in Craft'),
                'expiresInSeconds' => self::TTL,
                'instructions' => $confirmationRequired
                    ? Freeform::t('Explain the impact and show the clickable Craft review URL. The field has not changed.')
                    : Freeform::t('Explain the impact. If the user requested this change, call freeform.fields.apply-change with reviewId.'),
            ] + ($confirmationRequired ? [] : ['reviewId' => $token]);
        });
    }

    public static function review(string $token, bool $confirm = false, bool $viaMcp = false): array
    {
        $cache = \Craft::$app->getCache();
        $key = self::CACHE_PREFIX.$token;
        $review = preg_match('/^[a-f0-9]{64}$/D', $token) ? $cache->get($key) : false;
        if (!$review || $review['userId'] !== \Craft::$app->getUser()->getId()) {
            throw new ToolCallException('This review is unavailable. Request a new link using the same Craft account.');
        }

        return self::withTarget($review['form'], $review['site'], static function (Form $form, Site $site) use ($cache, $key, $review, $confirm, $viaMcp): array {
            [$impact, $revision, $record, $changes] = self::inspect($form, $site, $review['field'], $review['operation'], $review['input']);
            if (isset($impact['blockedBy']) || $cache->get($key) !== $review || $review['revision'] !== $revision) {
                throw new ToolCallException('The review expired or its impact changed. Request a fresh review.');
            }
            if (!$confirm) {
                return $impact;
            }
            if ($viaMcp && (($review['confirmationRequired'] ?? true) || SecurityPolicy::requiresDestructiveConfirmation())) {
                throw new ToolCallException('Open the private review link and confirm the change in Craft.');
            }
            if (!$cache->delete($key)) {
                throw new ToolCallException('The review expired. Request a fresh review.');
            }
            \Craft::$app->getDb()->transaction(static function () use ($form, $record, $changes): void {
                $record->metadata = $changes['metadata'];
                $record->type = $changes['type'];
                if (!$record->save(false, ['metadata', 'type'])) {
                    throw new ToolCallException('The field change could not be saved.');
                }
                Access::recordChange($form);
            });
            Access::afterSave($form);

            return ['status' => 'applied'] + $impact;
        });
    }

    private static function withTarget(string $form, string $site, callable $operation): array
    {
        return Access::run(Freeform::PERMISSION_FORMS_ACCESS, static function () use ($form, $site, $operation): array {
            $site = Access::site($site);
            $id = Access::form($form, $site)->getId();

            return Access::withLayoutLock($id, static function () use ($id, $form, $site, $operation): array {
                $target = Access::form($form, $site);
                if ($id !== $target->getId()) {
                    throw new ToolCallException('The form changed. Request a new review.');
                }
                Access::requireAllFormSites($target);
                Access::requireEditorOption('layout.fields');

                return $operation($target, $site);
            });
        });
    }

    private static function inspect(Form $form, Site $site, string $handle, string $operation, array $input): array
    {
        $field = $form->getLayout()->getFields()->get($handle);
        if (!$field || $field->getParentField() || !\in_array($field::class, PresetCatalog::TYPES, true)
            || ($field instanceof EncryptionInterface && $field->isEncrypted())) {
            throw new ToolCallException('Choose a supported top-level, unencrypted field.');
        }
        Access::requireEditorOption('layout.fieldTypes', $field::class);
        $record = FormFieldRecord::findOne(['formId' => $form->getId(), 'uid' => $field->getUid()]);
        $formRecord = FormRecord::findOne($form->getId());
        if (!$record || !$formRecord) {
            throw new ToolCallException('The form or field is unavailable.');
        }
        if (DuplicateCheckScope::isEnabled($form) && DuplicateCheckScope::getField($form)?->getId() === $field->getId()) {
            throw new ToolCallException('Review the duplicate-submission setting in Craft before changing this field.');
        }
        $ruleConditions = RuleConditionRecord::find()->where(['fieldId' => $record->id])->all();
        $ruleCount = \count($ruleConditions) + (int) FieldRuleRecord::find()->where(['fieldId' => $record->id])->count();
        $metadata = (array) JsonHelper::decode($record->metadata, true);
        [$changes, $detail, $values] = match ($operation) {
            'remove-choices' => self::removeChoices($field, $metadata, $input),
            'switch-source' => self::switchSource($field, $site, $metadata, $input),
            'change-type' => self::changeType($form, $field, $metadata, $input),
            default => throw new ToolCallException('Choose an available field change operation.'),
        };
        $blockedBy = null;
        foreach ($ruleConditions as $condition) {
            if ('remove-choices' !== $operation || self::mentionsRemovedValue($condition->value, $values)) {
                $blockedBy = 'This change can invalidate an existing condition. Review that rule in Craft before changing the field.';

                break;
            }
        }

        $rows = self::countAffected($form, $field, $values);
        $canReadSubmissions = PermissionHelper::checkPermission(Freeform::PERMISSION_SUBMISSIONS_ACCESS)
            && \in_array($form->getId(), array_map('intval', Freeform::getInstance()->forms->getAllowedReadFormIds()), true);
        $impact = [
            'formId' => $form->getId(),
            'form' => $form->getName(),
            'field' => $field->getHandle(),
            'label' => $field->getLabel(),
            'operation' => $operation,
            'change' => $detail,
            'submissionRowsWithStoredContent' => $canReadSubmissions ? $rows : null,
            'ruleReferences' => $ruleCount,
            'consequences' => [
                'This field change applies to every site using the form.',
                'Freeform retains existing stored values. They may display differently or cease to match the choices after this change.',
                'Review related templates, notifications and integration mappings before approving.',
            ],
        ] + (null === $blockedBy ? [] : ['blockedBy' => $blockedBy]);
        $revision = hash('sha256', serialize([$formRecord->getAttributes(), $record->getAttributes(), $changes, $rows, $ruleCount]));

        return [$impact, $revision, $record, $changes];
    }

    private static function removeChoices(FieldInterface $field, array $metadata, array $input): array
    {
        self::checkChoiceField($field);
        Access::requireEditorOption('layout.options.custom');
        $values = $input['removeValues'];
        $configuration = $field->getOptionConfiguration();
        if (!$configuration instanceof Custom || !$values || !array_is_list($values) || \count($values) > 50
            || $input['optionSource'] || $input['customOptions'] || null !== $input['targetType']) {
            throw new ToolCallException('Use removeValues with existing custom choice values only.');
        }
        if (\count(array_filter($values, 'is_string')) !== \count($values)) {
            throw new ToolCallException('Use individual stored choice values.');
        }
        $choices = $configuration->toArray()['options'];
        $existing = array_map('strval', array_column(array_filter($choices, static fn ($choice) => !$choice['optgroup']), 'value'));
        if (array_diff($values, $existing) || !array_diff($existing, $values)) {
            throw new ToolCallException('Choose existing values and leave at least one choice on the field.');
        }
        $metadata['optionConfiguration']['options'] = array_values(array_filter($choices, static fn ($choice) => $choice['optgroup'] || !\in_array((string) $choice['value'], $values, true)));
        $default = $metadata['defaultValue'] ?? null;
        if (\is_array($default)) {
            $metadata['defaultValue'] = array_values(array_diff($default, $values));
        } elseif (\is_scalar($default) && \in_array((string) $default, $values, true)) {
            $metadata['defaultValue'] = '';
        }

        return [['type' => $field::class, 'metadata' => $metadata], ['removedValues' => array_values(array_unique($values))], $values];
    }

    private static function switchSource(FieldInterface $field, Site $site, array $metadata, array $input): array
    {
        self::checkChoiceField($field);
        if ($input['removeValues'] || null !== $input['targetType'] || (null !== $input['optionSource']) === (bool) $input['customOptions']) {
            throw new ToolCallException('Supply one new live optionSource or a list of customOptions.');
        }
        if (null !== $input['optionSource']) {
            $configuration = ChoiceSources::configuration($input['optionSource'], $site);
            $detail = $input['optionSource'];
        } else {
            Access::requireEditorOption('layout.options.custom');
            $choices = $input['customOptions'];
            if (!array_is_list($choices) || \count($choices) > 50) {
                throw new ToolCallException('Supply up to 50 unique custom choices.');
            }
            $choices = array_map(static fn ($choice) => Access::text($choice, 150, true), $choices);
            if (\count(array_unique($choices)) !== \count($choices)) {
                throw new ToolCallException('Give each choice a unique value.');
            }
            $configuration = ['source' => 'custom', 'useCustomValues' => false, 'options' => array_map(static fn ($choice) => ['label' => $choice, 'value' => $choice, 'optgroup' => false], $choices)];
            $detail = ['type' => 'custom', 'choices' => \count($choices)];
        }
        if (FieldInterface::TYPE_SELECT === $field->getType()) {
            $configuration['emptyOption'] = $metadata['optionConfiguration']['emptyOption'] ?? Freeform::t('Please select');
        }
        if ($configuration === ($metadata['optionConfiguration'] ?? null)) {
            throw new ToolCallException('The field already has that choice source.');
        }
        $metadata['optionConfiguration'] = $configuration;
        $metadata['defaultValue'] = $field instanceof MultiValueInterface ? [] : '';

        return [['type' => $field::class, 'metadata' => $metadata], ['optionSource' => $detail], []];
    }

    private static function changeType(Form $form, FieldInterface $field, array $metadata, array $input): array
    {
        Access::requireEditorOption('layout.fields.types');
        $target = $input['targetType'];
        if ($input['removeValues'] || $input['customOptions'] || null !== $input['optionSource']
            || !\in_array($field->getType(), self::FIELD_TYPES, true) || !\in_array($target, self::FIELD_TYPES, true) || $target === $field->getType()) {
            throw new ToolCallException('Choose a different supported scalar field type.');
        }
        $type = PresetCatalog::TYPES[$target];
        Access::requireEditorOption('layout.fieldTypes', $type);
        $available = \Craft::$container->get(FormWizardService::class)->options();
        if (!\in_array($target, array_column($available['fieldTypes'], 'value'), true)) {
            throw new ToolCallException('That field type is unavailable in this edition or user profile.');
        }
        foreach (FormNotificationRecord::findAll(['formId' => $form->getId()]) as $notification) {
            if ($field->getUid() === (JsonHelper::decode($notification->metadata)?->field ?? null)) {
                throw new ToolCallException('This field is used by a notification. Review that notification in Craft first.');
            }
        }

        $defaults = [];
        foreach (\Craft::$container->get(PropertyProvider::class)->getEditableProperties($type) as $property) {
            if ($property->matchesEdition()) {
                $defaults[$property->handle] = $property->value;
            }
        }
        $base = array_intersect_key($metadata, array_flip(['handle', 'label', 'instructions', 'required']));
        $metadata = array_replace($defaults, $base);

        return [['type' => $type, 'metadata' => $metadata], ['fromType' => $field->getType(), 'toType' => $target], []];
    }

    private static function checkChoiceField(FieldInterface $field): void
    {
        if (!$field instanceof GeneratedOptionsInterface || !\in_array($field->getType(), ChoiceSources::FIELD_TYPES, true)) {
            throw new ToolCallException('Choose a dropdown, radio group, or checkbox group.');
        }
        $property = \Craft::$container->get(PropertyProvider::class)->getEditableProperties($field::class)->get('optionConfiguration');
        if (!$property || !$property->visible || $property->disabled || !$property->matchesEdition()) {
            throw new ToolCallException('The choice configuration is unavailable for this field.');
        }
    }

    private static function countAffected(Form $form, FieldInterface $field, array $values): int
    {
        $table = Submission::getContentTableName($form);
        $column = Submission::getFieldColumnName($field);
        $db = \Craft::$app->getDb();
        if (!$db->getTableSchema($table, true)?->getColumn($column)) {
            throw new ToolCallException('The field’s submission storage could not be checked.');
        }
        $query = (new Query())->from($table)->where(['<>', $column, '']);
        if (!$values) {
            return (int) $query->count('*', $db);
        }
        $multi = $field instanceof MultiValueInterface;
        if (!$multi) {
            $query->andWhere([$column => $values]);
        }

        $matches = 0;
        foreach ($query->select([$column])->each(250, $db) as $row) {
            if ($multi ? self::mentionsRemovedValue($row[$column], $values) : \in_array((string) $row[$column], $values, true)) {
                ++$matches;
            }
        }

        return $matches;
    }

    private static function mentionsRemovedValue(?string $stored, array $removed): bool
    {
        if (null === $stored) {
            return false;
        }
        $decoded = json_decode($stored, true);
        $values = \is_array($decoded) ? array_filter($decoded, 'is_scalar') : [$stored];

        return (bool) array_intersect(array_map('strval', $values), $removed);
    }
}
