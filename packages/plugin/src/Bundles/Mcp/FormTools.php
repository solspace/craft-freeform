<?php

namespace Solspace\Freeform\Bundles\Mcp;

use craft\db\Query;
use craft\mcp\attributes\RequiresPermission;
use craft\models\Site;
use Mcp\Capability\Attribute\McpTool;
use Mcp\Capability\Attribute\Schema;
use Mcp\Exception\ToolCallException;
use Mcp\Schema\ToolAnnotations;
use Solspace\Freeform\Bundles\Attributes\Property\PropertyProvider;
use Solspace\Freeform\Bundles\Persistence\FieldMetadata;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\Forms\PersistFormEvent;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Implementations\Pro\RatingField;
use Solspace\Freeform\Fields\Interfaces\GeneratedOptionsInterface;
use Solspace\Freeform\Fields\Interfaces\MaxLengthInterface;
use Solspace\Freeform\Fields\Interfaces\PlaceholderInterface;
use Solspace\Freeform\Fields\Properties\Options\Custom\Custom;
use Solspace\Freeform\Fields\Properties\Options\OptionsConfiguration;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Form\Managers\ContentManager;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\DataObjects\FormWizard\PresetCatalog;
use Solspace\Freeform\Library\FileUploads\UploadVolumePolicy;
use Solspace\Freeform\Library\Helpers\JsonHelper;
use Solspace\Freeform\Library\Helpers\SitesHelper;
use Solspace\Freeform\Records\Form\FormFieldRecord;
use Solspace\Freeform\Records\Form\FormLayoutRecord;
use Solspace\Freeform\Records\Form\FormRowRecord;
use Solspace\Freeform\Records\FormRecord;
use Solspace\Freeform\Services\FormWizardService;

final class FormTools
{
    #[McpTool(name: 'freeform.sites.list', description: 'List editable Craft sites and languages for Freeform operations.', annotations: new ToolAnnotations(readOnlyHint: true))]
    #[RequiresPermission('accessCp')]
    #[RequiresPermission('accessPlugin-freeform')]
    public function sites(): array
    {
        return Access::run('accessPlugin-freeform', static function (): array {
            $primaryId = \Craft::$app->getSites()->getPrimarySite()->id;
            $siteAware = SitesHelper::isEnabled();
            $sites = [];
            foreach (SitesHelper::getEditableSites() as $site) {
                if ($siteAware || $site->id === $primaryId) {
                    $sites[] = ['handle' => $site->handle, 'name' => $site->name, 'language' => $site->language];
                }
            }

            return ['siteAwareForms' => $siteAware, 'sites' => $sites];
        });
    }

    /** @param string $site Craft site handle from freeform.sites.list. */
    #[McpTool(name: 'freeform.forms.list', description: 'List active forms you can manage on a Craft site.', annotations: new ToolAnnotations(readOnlyHint: true))]
    #[RequiresPermission('accessCp')]
    #[RequiresPermission('accessPlugin-freeform')]
    #[RequiresPermission(Freeform::PERMISSION_FORMS_ACCESS)]
    public function listForms(string $site): array
    {
        return Access::run(Freeform::PERMISSION_FORMS_ACCESS, static function () use ($site): array {
            $site = Access::site($site);
            $forms = Freeform::getInstance()->forms->getAllNonArchivedForms(sites: SitesHelper::isEnabled() ? $site->handle : null);

            return ['forms' => array_values(array_map(self::describe(...), array_filter($forms, Access::canManage(...))))];
        });
    }

    #[McpTool(name: 'freeform.forms.get', description: 'Inspect form pages, row layout, field settings, and saved custom choices.', annotations: new ToolAnnotations(readOnlyHint: true))]
    #[RequiresPermission('accessCp')]
    #[RequiresPermission('accessPlugin-freeform')]
    #[RequiresPermission(Freeform::PERMISSION_FORMS_ACCESS)]
    public function getForm(string $form, string $site): array
    {
        return Access::run(Freeform::PERMISSION_FORMS_ACCESS, static function () use ($form, $site): array {
            $form = Access::form($form, Access::site($site));

            return self::describeLayout($form);
        });
    }

    #[McpTool(name: 'freeform.forms.creation-options', description: 'Discover field types, limits and permitted file upload volumes for creating forms.', annotations: new ToolAnnotations(readOnlyHint: true))]
    #[RequiresPermission('accessCp')]
    #[RequiresPermission('accessPlugin-freeform')]
    #[RequiresPermission(Freeform::PERMISSION_FORMS_CREATE)]
    public function creationOptions(string $site): array
    {
        return Access::run(Freeform::PERMISSION_FORMS_CREATE, static function () use ($site): array {
            Access::site($site);
            Access::requireEditorOption('layout.fields');
            $volumes = [];
            $policy = \Craft::$container->get(UploadVolumePolicy::class);
            foreach (\Craft::$app->getVolumes()->getAllVolumes() as $volume) {
                if ($policy->allowsSource($volume->id) && \Craft::$app->getUser()->checkPermission('saveAssets:'.$volume->uid)) {
                    $volumes[] = ['id' => (int) $volume->id, 'name' => $volume->name, 'handle' => $volume->handle];
                }
            }
            $options = \Craft::$container->get(FormWizardService::class)->options($volumes[0]['id'] ?? null);
            $fieldSettings = [];
            foreach ($options['fieldTypes'] as $type) {
                $properties = FieldSettings::ADDITIONAL_PROPERTIES;
                if ('rating' !== $type['value']) {
                    unset($properties['maxStars']);
                }
                $fieldSettings[$type['value']] = array_keys(array_intersect($properties, $type['editableProperties']));
                if (\in_array($type['value'], ChoiceSources::FIELD_TYPES, true) && \in_array('optionConfiguration', $type['editableProperties'], true)) {
                    $fieldSettings[$type['value']][] = 'optionSource';
                }
            }

            return [
                'fieldLimit' => $options['fieldLimit'],
                'fieldTypes' => array_column($options['fieldTypes'], 'value'),
                'fieldSettings' => $fieldSettings,
                'fieldWidths' => ['full', 'half', 'third', 'quarter'],
                'uploadVolumes' => $volumes,
            ];
        });
    }

    #[McpTool(name: 'freeform.fields.option-sources', description: 'Discover allowed Craft element sources and Freeform predefined lists for dropdown, radio and checkbox fields. Pass a result’s type and handle as optionSource when creating or adding a field.', annotations: new ToolAnnotations(readOnlyHint: true))]
    #[RequiresPermission('accessCp')]
    #[RequiresPermission('accessPlugin-freeform')]
    #[RequiresPermission(Freeform::PERMISSION_FORMS_ACCESS)]
    public function optionSources(string $site): array
    {
        return Access::run(Freeform::PERMISSION_FORMS_ACCESS, static function () use ($site): array {
            $site = Access::site($site);
            Access::requireEditorOption('layout.fields');

            return ['site' => $site->handle, 'sources' => ChoiceSources::catalog($site)];
        });
    }

    /**
     * @param list<array{handle: string, type: string, label: string, required?: bool, instructions?: string, options?: list<string>, placeholder?: string, maxLength?: int, maxStars?: int, width?: string}> $fields          Ordered fields. Use freeform.forms.creation-options to discover types and editable settings. Supply options for dropdown, radios and checkboxes.
     * @param list<string>                                                                                                                                                                                    $additionalSites Optional additional editable Craft site handles. Requires Site-Aware Forms.
     * @param null|int                                                                                                                                                                                        $uploadVolumeId  Asset volume for file fields, selected from freeform.forms.creation-options. File fields accept one PDF of up to 5 MB.
     */
    #[McpTool(name: 'freeform.forms.create', description: 'Create a form from validated field types. Use optionSource from freeform.fields.option-sources for element or predefined choices. For multiple pages, supply ordered pageLabels and assign fields a page number.', annotations: new ToolAnnotations(destructiveHint: false))]
    #[RequiresPermission('accessCp')]
    #[RequiresPermission('accessPlugin-freeform')]
    #[RequiresPermission(Freeform::PERMISSION_FORMS_CREATE)]
    public function createForm(
        string $name,
        string $handle,
        string $site,
        #[Schema(minItems: 1, maxItems: 100, items: [
            'type' => 'object',
            'required' => ['handle', 'type', 'label'],
            'additionalProperties' => false,
            'properties' => FieldSettings::CREATION_PROPERTIES + [
                'page' => ['type' => 'integer', 'minimum' => 1, 'description' => 'One-based page number from pageLabels. Defaults to the first page.'],
                'width' => ['type' => 'string', 'enum' => ['full', 'half', 'third', 'quarter'], 'description' => 'Consecutive fields with the same width share a row when there is room. Defaults to full.'],
            ],
        ])]
        array $fields,
        ?int $uploadVolumeId = null,
        #[Schema(items: ['type' => 'string'], maxItems: 30)]
        array $additionalSites = [],
        #[Schema(items: ['type' => 'string'])]
        array $pageLabels = [],
    ): array {
        return Access::run(Freeform::PERMISSION_FORMS_CREATE, static function () use ($name, $handle, $site, $fields, $uploadVolumeId, $additionalSites, $pageLabels): array {
            $site = Access::site($site);
            $siteIds = [(int) $site->id];
            if (!array_is_list($additionalSites) || \count($additionalSites) > 30) {
                throw new ToolCallException('Choose up to 30 additional sites.');
            }
            foreach ($additionalSites as $additionalSite) {
                if (!\is_string($additionalSite)) {
                    throw new ToolCallException('Use site handles from freeform.sites.list.');
                }
                $siteIds[] = (int) Access::site($additionalSite)->id;
            }
            Access::requireEditorOption('layout.fields');
            Access::requireEditorOption('settings.tab.general.handle');
            if (!preg_match('/^[a-zA-Z][a-zA-Z0-9_]{0,99}$/D', $handle) || !$fields || !array_is_list($fields) || \count($fields) > 100) {
                throw new ToolCallException('Supply a valid form handle and between 1 and 100 fields.');
            }

            if (!array_is_list($pageLabels)) {
                throw new ToolCallException('Supply page labels as an ordered list.');
            }
            if (\count($pageLabels) > 1) {
                if (!Freeform::getInstance()->edition()->isAtLeast(Freeform::EDITION_LITE)) {
                    throw new ToolCallException('Multi-page forms require Freeform Lite or Pro.');
                }
                Access::requireEditorOption('layout.multiPageForms');
            }
            $pageLabels = array_map(static fn ($label) => Access::text($label, 100, true), $pageLabels);
            [$wizardFields, $fieldSettings] = self::prepareFields($fields, $site, $uploadVolumeId, max(1, \count($pageLabels)));
            if ($pageLabels && \count(array_unique(array_column($wizardFields, 'page'))) !== \count($pageLabels)) {
                throw new ToolCallException('Add at least one field to every page.');
            }

            return Access::withLayoutLock(0, static function () use ($name, $handle, $siteIds, $wizardFields, $uploadVolumeId, $fieldSettings, $pageLabels): array {
                if (FormRecord::find()->where(['handle' => $handle])->exists()) {
                    throw new ToolCallException('This form handle already exists. Inspect the existing form or choose another handle.');
                }
                $form = \Craft::$container->get(FormWizardService::class)->create([
                    'purpose' => 'other',
                    'name' => Access::text($name, 100, true),
                    'handle' => $handle,
                    'siteIds' => array_values(array_unique($siteIds)),
                    'fields' => $wizardFields,
                ], useFieldHandles: true, uploadVolumeId: $uploadVolumeId, fieldSettings: $fieldSettings, pageLabels: $pageLabels);

                return self::describeLayout($form);
            });
        });
    }

    /**
     * @param string      $field        Field handle from freeform.forms.get.
     * @param null|string $instructions Plain-text base instructions. Supply an empty string to clear them.
     * @param null|string $placeholder  Plain-text base placeholder. Supply an empty string to clear it.
     * @param null|int    $maxLength    Character limit for a supported field. Supply 0 to clear it.
     * @param null|int    $maxStars     rating field star count, from 3 through 10
     */
    #[McpTool(name: 'freeform.fields.update', description: 'Patch a field’s base label, instructions, placeholder, required flag, character limit or rating star count. Shared settings apply across sites.', annotations: new ToolAnnotations(destructiveHint: false, idempotentHint: true))]
    #[RequiresPermission('accessCp')]
    #[RequiresPermission('accessPlugin-freeform')]
    #[RequiresPermission(Freeform::PERMISSION_FORMS_ACCESS)]
    public function updateField(
        string $form,
        string $site,
        string $field,
        ?string $label = null,
        ?bool $required = null,
        ?string $instructions = null,
        ?string $placeholder = null,
        ?int $maxLength = null,
        ?int $maxStars = null,
    ): array {
        $changes = array_filter(compact('label', 'required', 'instructions', 'placeholder', 'maxLength', 'maxStars'), static fn ($value) => null !== $value);

        return Access::run(Freeform::PERMISSION_FORMS_ACCESS, static function () use ($form, $site, $field, $changes): array {
            $site = Access::site($site);
            $id = Access::form($form, $site)->getId();

            return Access::withLayoutLock($id, static function () use ($form, $site, $field, $changes): array {
                $form = Access::form($form, $site);
                Access::requireAllFormSites($form);
                $field = $form->getLayout()->getFields()->get($field);
                if (!$field || !$changes) {
                    throw new ToolCallException('Choose a field and supply at least one setting.');
                }
                Access::requireEditorOption('layout.fields');
                Access::requireEditorOption('layout.fieldTypes', $field::class);
                $changes = FieldSettings::validate($field::class, $changes);
                if ($field instanceof RatingField && isset($changes['maxStars']) && $changes['maxStars'] < $field->getMaxValue()) {
                    $table = Submission::getContentTableName($form);
                    $column = Submission::getFieldColumnName($field);
                    $removedRatings = array_map('strval', range($changes['maxStars'] + 1, RatingField::MAX_VALUE));
                    if (!\Craft::$app->getDb()->getTableSchema($table, true)?->getColumn($column)
                        || (new Query())->from($table)->where([$column => $removedRatings])->exists()) {
                        throw new ToolCallException('Reducing this scale could hide saved ratings. Review the scale and submissions in the builder.');
                    }
                }
                $record = FormFieldRecord::findOne(['formId' => $form->getId(), 'uid' => $field->getUid()]);
                if (!$record) {
                    throw new ToolCallException('The field no longer exists.');
                }

                $metadata = JsonHelper::decode($record->metadata) ?: new \stdClass();
                foreach ($changes as $key => $value) {
                    $metadata->{FieldSettings::propertyName($key)} = $value;
                }

                \Craft::$app->getDb()->transaction(static function () use ($record, $metadata, $form): void {
                    $record->metadata = $metadata;
                    if (!$record->save()) {
                        throw new ToolCallException('The field could not be saved.');
                    }
                    Access::recordChange($form);
                });

                Access::afterSave($form);

                return ['field' => $field->getHandle(), 'updated' => $changes];
            });
        });
    }

    /**
     * @param int      $page           One-based page number from freeform.forms.get.
     * @param null|int $uploadVolumeId File field volume from freeform.forms.creation-options.
     */
    #[McpTool(name: 'freeform.fields.add', description: 'Add a field in a new row at the end of an existing form page. Read the form first to choose its page number. Use optionSource from freeform.fields.option-sources for element or predefined choices.', annotations: new ToolAnnotations(destructiveHint: false))]
    #[RequiresPermission('accessCp')]
    #[RequiresPermission('accessPlugin-freeform')]
    #[RequiresPermission(Freeform::PERMISSION_FORMS_ACCESS)]
    public function addField(
        string $form,
        string $site,
        int $page,
        #[Schema(type: 'object', required: ['handle', 'type', 'label'], properties: FieldSettings::CREATION_PROPERTIES, additionalProperties: false)]
        array $field,
        ?int $uploadVolumeId = null,
    ): array {
        return Access::run(Freeform::PERMISSION_FORMS_ACCESS, static function () use ($form, $site, $page, $field, $uploadVolumeId): array {
            $site = Access::site($site);
            $id = Access::form($form, $site)->getId();

            return Access::withLayoutLock($id, static function () use ($form, $site, $page, $field, $uploadVolumeId): array {
                $form = Access::form($form, $site);
                Access::requireAllFormSites($form);
                Access::requireEditorOption('layout.fields');
                Access::requireEditorOption('layout.fields.handles');
                $target = $page > 0 ? $form->getPages()->getByIndex($page - 1) : null;
                if (!$target) {
                    throw new ToolCallException('Choose an existing page number from freeform.forms.get.');
                }

                $wizard = \Craft::$container->get(FormWizardService::class);
                $options = $wizard->options($uploadVolumeId);
                if (Freeform::getInstance()->edition()->is(Freeform::EDITION_EXPRESS) && FormFieldRecord::find()->where(['formId' => $form->getId()])->count() >= $options['fieldLimit']) {
                    throw new ToolCallException('This form has reached its edition’s field limit.');
                }

                [$fields, $settings] = self::prepareFields([$field], $site, $uploadVolumeId);
                $layoutUid = $target->getLayout()->getUid();
                $layout = FormLayoutRecord::findOne(['formId' => $form->getId(), 'uid' => $layoutUid]);
                if (!$layout || !$layoutUid) {
                    throw new ToolCallException('The target page layout no longer exists.');
                }
                [$rows, $records] = $wizard->buildFieldLayout($fields, $layoutUid, $options, useFieldHandles: true, uploadVolumeId: $uploadVolumeId, fieldSettings: $settings);
                self::appendField($form, (int) $layout->id, $rows[0]->uid, $records[0]);
                Access::afterSave($form);
                $updated = Access::form($form->getHandle(), $site)->getLayout()->getFields()->get($fields[0]['key']);
                if (!$updated) {
                    throw new ToolCallException('The field was saved but could not be read back.');
                }

                return ['page' => $page, 'field' => self::describeField($updated)];
            });
        });
    }

    #[McpTool(name: 'freeform.fields.request-removal', description: 'Prepare a field-removal impact preview and private Craft review link. If confirmationRequired is true, ask the user to approve in Craft. This tool does not remove the field.', annotations: new ToolAnnotations(readOnlyHint: false, destructiveHint: false, openWorldHint: false))]
    #[RequiresPermission('accessCp')]
    #[RequiresPermission('accessPlugin-freeform')]
    #[RequiresPermission(Freeform::PERMISSION_FORMS_ACCESS)]
    public function requestFieldRemoval(string $form, string $site, string $field): array
    {
        return FieldRemoval::request($form, $site, $field);
    }

    #[McpTool(name: 'freeform.fields.remove', title: 'Remove Freeform field', description: 'Remove the exact field in a current removal preview, using its reviewId. Available when a Craft admin has disabled destructive MCP confirmation. Otherwise approval is required via the Craft review link.', annotations: new ToolAnnotations(readOnlyHint: false, destructiveHint: true, openWorldHint: false))]
    #[RequiresPermission('accessCp')]
    #[RequiresPermission('accessPlugin-freeform')]
    #[RequiresPermission(Freeform::PERMISSION_FORMS_ACCESS)]
    public function removeField(string $reviewId): array
    {
        return FieldRemoval::removeViaMcp($reviewId);
    }

    private static function appendField(Form $form, int $layoutId, string $rowUid, \stdClass $field): void
    {
        $event = new PersistFormEvent((object) [], $form->getId());
        $metadata = FieldMetadata::validate(\Craft::$container->get(PropertyProvider::class), $field, $event);
        if ($event->hasErrors()) {
            throw new ToolCallException('Check the new field’s settings before adding it.');
        }

        $formId = $form->getId();
        $handles = [];
        foreach (FormFieldRecord::find()->where(['formId' => $formId])->each() as $existing) {
            $handles[$existing->uid] = JsonHelper::decode($existing->metadata)?->handle ?? '';
        }
        $row = new FormRowRecord();
        $row->formId = $formId;
        $row->layoutId = $layoutId;
        $row->uid = $rowUid;
        $row->order = (int) (FormRowRecord::find()->where(['formId' => $formId, 'layoutId' => $layoutId])->max('[[order]]') ?? -1) + 1;
        $record = new FormFieldRecord();
        $record->uid = $field->uid;
        $record->formId = $formId;
        $record->type = $field->typeClass;
        $record->order = 0;
        $record->metadata = (object) $metadata;
        $record->setLayoutHandles($handles);
        if (!$record->validate()) {
            throw new ToolCallException(implode(' ', $record->getFirstErrors()));
        }

        try {
            \Craft::$app->getDb()->transaction(static function () use ($row, $record, $form): void {
                if (!$row->save()) {
                    throw new ToolCallException('The new row could not be saved.');
                }
                $record->rowId = $row->id;
                if (!$record->save()) {
                    throw new ToolCallException('The new field could not be saved.');
                }
                Access::recordChange($form);
                (new ContentManager($form, [$record]))->addFieldColumns();
            });
        } catch (\Throwable $exception) {
            // MySQL can commit the new records implicitly before a failed ALTER TABLE.
            FormFieldRecord::deleteAll(['formId' => $formId, 'uid' => $record->uid]);
            FormRowRecord::deleteAll(['formId' => $formId, 'uid' => $row->uid]);

            throw $exception;
        }
    }

    private static function prepareFields(array $fields, Site $site, ?int $uploadVolumeId, int $pageCount = 1): array
    {
        $wizardFields = [];
        $fieldSettings = [];
        $handles = [];
        foreach ($fields as $field) {
            $key = $field['handle'] ?? null;
            $type = $field['type'] ?? null;
            if (!\is_array($field) || !\is_string($key) || !preg_match('/^[a-zA-Z][a-zA-Z0-9]{0,59}$/D', $key)
                || !\is_string($type) || !isset(PresetCatalog::TYPES[$type]) || isset($handles[strtolower($key)])
                || (isset($field['required']) && !\is_bool($field['required']))) {
                throw new ToolCallException('Each field needs a unique alphanumeric handle, a type, a label, and an optional boolean required flag.');
            }
            Access::requireEditorOption('layout.fieldTypes', PresetCatalog::TYPES[$type]);
            if ('file' === $type && (!$uploadVolumeId || $uploadVolumeId < 1)) {
                throw new ToolCallException('File fields require an uploadVolumeId.');
            }
            $page = $field['page'] ?? 1;
            if (!\is_int($page) || $page < 1 || $page > $pageCount) {
                throw new ToolCallException('Choose a page number within the form layout.');
            }
            $handles[strtolower($key)] = true;
            $choiceField = \in_array($type, ChoiceSources::FIELD_TYPES, true);
            if (\array_key_exists('optionSource', $field)) {
                $property = \Craft::$container->get(PropertyProvider::class)->getEditableProperties(PresetCatalog::TYPES[$type])->get('optionConfiguration');
                if (!$choiceField || !$property || !$property->visible || $property->disabled || !$property->matchesEdition()) {
                    throw new ToolCallException('This field does not support live choice sources.');
                }
                if (\array_key_exists('options', $field)) {
                    throw new ToolCallException('Supply either custom options or optionSource for a choice field.');
                }
                $fieldSettings[$key]['optionConfiguration'] = ChoiceSources::configuration($field['optionSource'], $site);
            } elseif ($choiceField) {
                Access::requireEditorOption('layout.options.custom');
            }
            $settings = array_intersect_key($field, FieldSettings::ADDITIONAL_PROPERTIES);
            if ($settings) {
                foreach (FieldSettings::validate(PresetCatalog::TYPES[$type], $settings) as $setting => $value) {
                    $fieldSettings[$key][FieldSettings::propertyName($setting)] = $value;
                }
            }
            $wizardFields[] = [
                'key' => $key,
                'type' => $type,
                'label' => Access::text($field['label'] ?? null, 200, true),
                'instructions' => Access::text($field['instructions'] ?? '', 500),
                'required' => $field['required'] ?? false,
                'options' => $field['options'] ?? [],
                'width' => $field['width'] ?? 'full',
                'page' => $page - 1,
            ];
        }

        return [$wizardFields, $fieldSettings];
    }

    private static function describe(Form $form): array
    {
        return [
            'handle' => $form->getHandle(),
            'name' => $form->getName(),
            'type' => $form->getType(),
            'description' => $form->getDescription(),
        ];
    }

    private static function describeField(FieldInterface $field): array
    {
        $description = [
            'handle' => $field->getHandle(),
            'type' => $field->getType(),
            'label' => $field->getLabel(),
            'required' => $field->isRequired(),
            'instructions' => $field->getInstructions(),
        ];
        if ($field instanceof PlaceholderInterface) {
            $description['placeholder'] = $field->getPlaceholder();
        }
        if ($field instanceof MaxLengthInterface) {
            $description['maxLength'] = $field->getMaxLength();
        }
        if ($field instanceof RatingField) {
            $description['maxStars'] = $field->getMaxValue();
        }
        if ($field instanceof GeneratedOptionsInterface) {
            $configuration = $field->getOptionConfiguration();
            if ($configuration instanceof Custom) {
                $description['customOptions'] = $configuration->toArray()['options'];
            } elseif ($configuration instanceof OptionsConfiguration && $configuration->getTypeClass()) {
                $description['optionSource'] = ChoiceSources::describe($configuration);
            }
        }

        return $description;
    }

    private static function describeLayout(Form $form): array
    {
        $pages = [];
        foreach ($form->getPages() as $page) {
            $rows = [];
            foreach ($page->getRows() as $row) {
                $rows[] = array_map(static fn (FieldInterface $field) => $field->getHandle(), iterator_to_array($row->getFields(), false));
            }
            $pages[] = [
                'number' => \count($pages) + 1,
                'uid' => $page->getUid(),
                'label' => $page->getLabel(),
                'submitLabel' => $page->getButtons()->getSubmitLabel(),
                'backLabel' => $page->getButtons()->isBack() ? $page->getButtons()->getBackLabel() : null,
                'fields' => array_map(self::describeField(...), iterator_to_array($page->getFields(), false)),
                'rows' => $rows,
            ];
        }

        return self::describe($form) + ['pages' => $pages];
    }
}
