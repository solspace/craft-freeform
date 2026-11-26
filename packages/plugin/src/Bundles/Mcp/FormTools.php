<?php

namespace Solspace\Freeform\Bundles\Mcp;

use craft\mcp\attributes\RequiresPermission;
use Mcp\Capability\Attribute\McpTool;
use Mcp\Capability\Attribute\Schema;
use Mcp\Exception\ToolCallException;
use Mcp\Schema\ToolAnnotations;
use Solspace\Freeform\Bundles\Attributes\Property\PropertyProvider;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\DataObjects\FormWizard\PresetCatalog;
use Solspace\Freeform\Library\FileUploads\UploadVolumePolicy;
use Solspace\Freeform\Library\Helpers\JsonHelper;
use Solspace\Freeform\Library\Helpers\SitesHelper;
use Solspace\Freeform\Records\Form\FormFieldRecord;
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

    #[McpTool(name: 'freeform.forms.get', description: 'Inspect a form and the labels, types, handles and required flags of its fields.', annotations: new ToolAnnotations(readOnlyHint: true))]
    #[RequiresPermission('accessCp')]
    #[RequiresPermission('accessPlugin-freeform')]
    #[RequiresPermission(Freeform::PERMISSION_FORMS_ACCESS)]
    public function getForm(string $form, string $site): array
    {
        return Access::run(Freeform::PERMISSION_FORMS_ACCESS, static function () use ($form, $site): array {
            $form = Access::form($form, Access::site($site));
            $pages = [];
            foreach ($form->getPages() as $page) {
                $pages[] = [
                    'label' => $page->getLabel(),
                    'fields' => array_map(self::describeField(...), iterator_to_array($page->getFields(), false)),
                ];
            }

            return self::describe($form) + ['pages' => $pages];
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

            return [
                'fieldLimit' => $options['fieldLimit'],
                'fieldTypes' => array_column($options['fieldTypes'], 'value'),
                'uploadVolumes' => $volumes,
            ];
        });
    }

    /**
     * @param list<array{handle: string, type: string, label: string, required?: bool, instructions?: string, options?: list<string>}> $fields          Ordered fields. See freeform.forms.creation-options for types. Supply options for dropdown, radios and checkboxes. Use checkbox for a single consent checkbox.
     * @param list<string>                                                                                                             $additionalSites Optional additional editable Craft site handles. Requires Site-Aware Forms.
     * @param null|int                                                                                                                 $uploadVolumeId  Asset volume for file fields, selected from freeform.forms.creation-options. File fields accept one PDF of up to 5 MB.
     */
    #[McpTool(name: 'freeform.forms.create', description: 'Create a single-page form using validated Freeform field types. Supply approved consent wording if needed.', annotations: new ToolAnnotations(destructiveHint: false))]
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
            'properties' => [
                'handle' => ['type' => 'string'],
                'type' => ['type' => 'string'],
                'label' => ['type' => 'string'],
                'required' => ['type' => 'boolean'],
                'instructions' => ['type' => 'string'],
                'options' => ['type' => 'array', 'items' => ['type' => 'string']],
            ],
        ])]
        array $fields,
        ?int $uploadVolumeId = null,
        #[Schema(items: ['type' => 'string'], maxItems: 30)]
        array $additionalSites = [],
    ): array {
        return Access::run(Freeform::PERMISSION_FORMS_CREATE, static function () use ($name, $handle, $site, $fields, $uploadVolumeId, $additionalSites): array {
            $siteIds = [(int) Access::site($site)->id];
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

            $wizardFields = [];
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
                $handles[strtolower($key)] = true;
                $wizardFields[] = [
                    'key' => $key,
                    'type' => $type,
                    'label' => Access::text($field['label'] ?? null, 200, true),
                    'instructions' => Access::text($field['instructions'] ?? '', 500),
                    'required' => $field['required'] ?? false,
                    'options' => $field['options'] ?? [],
                ];
            }

            return Access::withLayoutLock(0, static function () use ($name, $handle, $siteIds, $wizardFields, $uploadVolumeId): array {
                if (FormRecord::find()->where(['handle' => $handle])->exists()) {
                    throw new ToolCallException('This form handle already exists. Inspect the existing form or choose another handle.');
                }
                $form = \Craft::$container->get(FormWizardService::class)->create([
                    'purpose' => 'other',
                    'name' => Access::text($name, 100, true),
                    'handle' => $handle,
                    'siteIds' => array_values(array_unique($siteIds)),
                    'fields' => $wizardFields,
                ], useFieldHandles: true, uploadVolumeId: $uploadVolumeId);

                return self::describe($form);
            });
        });
    }

    /** @param string $field Field handle from freeform.forms.get. */
    #[McpTool(name: 'freeform.fields.update', description: 'Patch a field’s base label or required flag. A base edit applies to every site without a corresponding translation.', annotations: new ToolAnnotations(destructiveHint: false, idempotentHint: true))]
    #[RequiresPermission('accessCp')]
    #[RequiresPermission('accessPlugin-freeform')]
    #[RequiresPermission(Freeform::PERMISSION_FORMS_ACCESS)]
    public function updateField(string $form, string $site, string $field, ?string $label = null, ?bool $required = null): array
    {
        return Access::run(Freeform::PERMISSION_FORMS_ACCESS, static function () use ($form, $site, $field, $label, $required): array {
            $site = Access::site($site);
            $id = Access::form($form, $site)->getId();

            return Access::withLayoutLock($id, static function () use ($form, $site, $field, $label, $required): array {
                $form = Access::form($form, $site);
                Access::requireAllFormSites($form);
                $field = $form->getLayout()->getFields()->get($field);
                if (!$field || (null === $label && null === $required)) {
                    throw new ToolCallException('Choose a field and supply a label or required flag.');
                }
                Access::requireEditorOption('layout.fields');
                Access::requireEditorOption('layout.fieldTypes', $field::class);
                $properties = \Craft::$container->get(PropertyProvider::class)->getEditableProperties($field::class);
                $record = FormFieldRecord::findOne(['formId' => $form->getId(), 'uid' => $field->getUid()]);
                if (!$record) {
                    throw new ToolCallException('The field no longer exists.');
                }

                $metadata = JsonHelper::decode($record->metadata) ?: new \stdClass();
                $changes = array_filter(['label' => $label, 'required' => $required], static fn ($value) => null !== $value);
                foreach ($changes as $key => &$value) {
                    $property = $properties->get($key);
                    if (!$property || !$property->visible || $property->disabled || !$property->matchesEdition()) {
                        throw new ToolCallException("This field does not support editing {$key}.");
                    }
                    $value = 'label' === $key ? Access::text($value, 200, true) : $value;
                    foreach ($property->validators as $validator) {
                        if ($errors = $validator->validate($value)) {
                            throw new ToolCallException(implode(' ', $errors));
                        }
                    }
                    $metadata->{$key} = $value;
                }
                unset($value);

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
        return [
            'handle' => $field->getHandle(),
            'type' => $field->getType(),
            'label' => $field->getLabel(),
            'required' => $field->isRequired(),
            'instructions' => $field->getInstructions(),
        ];
    }
}
