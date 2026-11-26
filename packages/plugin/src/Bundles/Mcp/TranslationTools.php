<?php

namespace Solspace\Freeform\Bundles\Mcp;

use craft\mcp\attributes\RequiresPermission;
use Mcp\Capability\Attribute\McpTool;
use Mcp\Capability\Attribute\Schema;
use Mcp\Exception\ToolCallException;
use Mcp\Schema\ToolAnnotations;
use Solspace\Freeform\Bundles\Attributes\Property\PropertyProvider;
use Solspace\Freeform\Bundles\Form\Limiting\LimitedUsers\LimitedUserChecker;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Helpers\JsonHelper;
use Solspace\Freeform\Library\Helpers\SitesHelper;
use Solspace\Freeform\Records\Form\FormFieldRecord;
use Solspace\Freeform\Records\Form\FormPageRecord;
use Solspace\Freeform\Records\FormRecord;
use Solspace\Freeform\Records\FormTranslationRecord;

final class TranslationTools
{
    #[McpTool(name: 'freeform.translations.missing', description: 'Find forms with missing editable translation strings for one Craft site.', annotations: new ToolAnnotations(readOnlyHint: true))]
    #[RequiresPermission('accessCp')]
    #[RequiresPermission('accessPlugin-freeform')]
    #[RequiresPermission(Freeform::PERMISSION_FORMS_ACCESS)]
    public function missing(string $site): array
    {
        return Access::run(Freeform::PERMISSION_FORMS_ACCESS, static function () use ($site): array {
            self::requireSiteAware();
            $site = Access::site($site);
            $forms = [];
            foreach (Freeform::getInstance()->forms->getAllNonArchivedForms(sites: $site->handle) as $form) {
                if (!Access::canManage($form)) {
                    continue;
                }

                $missing = 0;
                foreach (self::catalog($form, (int) $site->id)['strings'] as $string) {
                    $missing += (int) $string['missing'];
                }
                if ($missing) {
                    $forms[] = ['form' => $form->getHandle(), 'missing' => $missing, 'enabled' => Freeform::getInstance()->translations->isTranslationsEnabled($form)];
                }
            }

            return ['site' => $site->handle, 'language' => $site->language, 'forms' => $forms];
        });
    }

    #[McpTool(name: 'freeform.translations.get', description: 'Get source text, stored translations, missing keys and a revision for one form and target site.', annotations: new ToolAnnotations(readOnlyHint: true))]
    #[RequiresPermission('accessCp')]
    #[RequiresPermission('accessPlugin-freeform')]
    #[RequiresPermission(Freeform::PERMISSION_FORMS_ACCESS)]
    public function get(string $form, string $site): array
    {
        return Access::run(Freeform::PERMISSION_FORMS_ACCESS, static function () use ($form, $site): array {
            self::requireSiteAware();
            $site = Access::site($site);
            $form = Access::form($form, $site);

            return self::response($form, $site->handle, $site->language, self::catalog($form, (int) $site->id));
        });
    }

    /**
     * @param string                                 $revision     Revision returned by freeform.translations.get.
     * @param list<array{key: string, text: string}> $translations Translate the source strings and use the corresponding catalog keys. Preserve message placeholders.
     * @param bool                                   $enable       Enable translations on the form if disabled. Requires access to every site using the form.
     */
    #[McpTool(name: 'freeform.translations.save', description: 'Patch approved translations for one form and one site. Omitted strings and other sites are preserved.', annotations: new ToolAnnotations(destructiveHint: false))]
    #[RequiresPermission('accessCp')]
    #[RequiresPermission('accessPlugin-freeform')]
    #[RequiresPermission(Freeform::PERMISSION_FORMS_ACCESS)]
    public function save(
        string $form,
        string $site,
        string $revision,
        #[Schema(minItems: 1, maxItems: 250, items: [
            'type' => 'object',
            'required' => ['key', 'text'],
            'additionalProperties' => false,
            'properties' => ['key' => ['type' => 'string'], 'text' => ['type' => 'string']],
        ])]
        array $translations,
        bool $enable = false,
    ): array {
        return Access::run(Freeform::PERMISSION_FORMS_ACCESS, static function () use ($form, $site, $revision, $translations, $enable): array {
            self::requireSiteAware();
            $site = Access::site($site);
            $id = Access::form($form, $site)->getId();

            return Access::withLayoutLock($id, static function () use ($form, $site, $revision, $translations, $enable): array {
                $form = Access::form($form, $site);
                $catalog = self::catalog($form, (int) $site->id);
                if (!hash_equals($catalog['revision'], $revision)) {
                    throw new ToolCallException('The form or its translations changed. Get a fresh translation catalog before saving.');
                }
                if (!$translations || !array_is_list($translations) || \count($translations) > 250) {
                    throw new ToolCallException('Supply between 1 and 250 translations.');
                }

                $enabled = Freeform::getInstance()->translations->isTranslationsEnabled($form);
                if (!$enabled) {
                    if (!$enable) {
                        throw new ToolCallException('This form has translations disabled. Confirm enabling them and retry with enable=true.');
                    }
                    Access::requireAllFormSites($form);
                    Access::requireEditorOption('settings.tab.general.translations');
                }

                $entries = array_column($catalog['strings'], null, 'key');
                $stored = $catalog['stored'];
                $seen = [];
                foreach ($translations as $translation) {
                    $key = $translation['key'] ?? null;
                    if (!\is_string($key) || !isset($entries[$key]) || isset($seen[$key])) {
                        throw new ToolCallException('Use unique translation keys from the current catalog.');
                    }
                    $seen[$key] = true;
                    [$type, $namespace, $property] = explode('.', $key, 4);
                    $text = Access::text($translation['text'] ?? null, 4000, true);
                    $stored->{$type} ??= new \stdClass();
                    $stored->{$type}->{$namespace} ??= new \stdClass();
                    $target = $stored->{$type}->{$namespace};
                    if (isset($entries[$key]['optionValue'])) {
                        $target->{$property} ??= new \stdClass();
                        self::setOptionLabel($target->{$property}, $entries[$key]['optionValue'], $text);
                    } else {
                        $target->{$property} = $text;
                    }
                }

                \Craft::$app->getDb()->transaction(static function () use ($form, $site, $stored, $enabled): void {
                    if (!$enabled) {
                        $record = FormRecord::findOne($form->getId());
                        $metadata = JsonHelper::decode($record->metadata);
                        $metadata->general->translations = true;
                        $record->metadata = $metadata;
                        if (!$record->save(false, ['metadata'])) {
                            throw new ToolCallException('Translations could not be enabled.');
                        }
                    }

                    $record = self::record($form, (int) $site->id) ?? new FormTranslationRecord();
                    $record->formId = $form->getId();
                    $record->siteId = $site->id;
                    $record->translations = json_encode($stored, \JSON_THROW_ON_ERROR | \JSON_UNESCAPED_UNICODE);
                    if (!$record->save()) {
                        throw new ToolCallException('Translations could not be saved.');
                    }
                    Access::recordChange($form);
                });

                Freeform::getInstance()->translations->clearFormCache($form->getId());
                Access::afterSave($form);

                return ['form' => $form->getHandle(), 'site' => $site->handle, 'saved' => \count($seen)];
            });
        });
    }

    private static function requireSiteAware(): void
    {
        if (!SitesHelper::isEnabled()) {
            throw new ToolCallException('Translations require Freeform Pro and Site-Aware Forms.');
        }
    }

    private static function response(Form $form, string $site, string $language, array $catalog): array
    {
        return [
            'form' => $form->getHandle(),
            'site' => $site,
            'language' => $language,
            'enabled' => Freeform::getInstance()->translations->isTranslationsEnabled($form),
            'revision' => $catalog['revision'],
            'strings' => $catalog['strings'],
        ];
    }

    private static function record(Form $form, int $siteId): ?FormTranslationRecord
    {
        return FormTranslationRecord::findOne(['formId' => $form->getId(), 'siteId' => $siteId]);
    }

    private static function findOptionLabel(mixed $configuration, string $value): ?string
    {
        foreach ($configuration->options ?? [] as $option) {
            if ($value === (string) ($option->value ?? '') && \is_string($option->label ?? null)) {
                return $option->label;
            }
        }

        return null;
    }

    private static function setOptionLabel(object $configuration, string $value, string $text): void
    {
        $configuration->options ??= [];
        foreach ($configuration->options as $option) {
            if ($value === (string) ($option->value ?? '')) {
                $option->label = $text;

                return;
            }
        }

        $configuration->options[] = (object) ['value' => $value, 'label' => $text];
    }

    private static function catalog(Form $form, int $siteId): array
    {
        $stored = JsonHelper::decode(self::record($form, $siteId)?->translations) ?: new \stdClass();
        $strings = [];
        $add = static function (string $type, string $namespace, string $property, mixed $source, string $context, ?string $optionValue = null) use (&$strings, $stored): void {
            if (!\is_string($source) || '' === trim($source) || strip_tags($source) !== $source
                || str_contains($source, '{{') || str_contains($source, '{%')) {
                return;
            }
            $translation = $stored->{$type}->{$namespace}->{$property} ?? null;
            $key = "{$type}.{$namespace}.{$property}";
            if (null !== $optionValue) {
                $key .= '.'.hash('sha256', $optionValue);
                $translation = self::findOptionLabel($translation, $optionValue);
            }
            $strings[] = [
                'key' => $key,
                'context' => $context,
                'source' => $source,
                'translation' => \is_string($translation) ? $translation : null,
                'missing' => !\is_string($translation) || '' === trim($translation),
            ] + (null === $optionValue ? [] : ['optionValue' => $optionValue]);
        };

        $propertyProvider = \Craft::$container->get(PropertyProvider::class);
        $limitations = \Craft::$container->get(LimitedUserChecker::class);
        foreach (['general' => $form->getSettings()->getGeneral(), 'behavior' => $form->getSettings()->getBehavior()] as $namespace => $settings) {
            foreach ($propertyProvider->getEditableProperties($settings) as $property) {
                if ($property->translatable && $property->visible && !$property->disabled && $property->matchesEdition()
                    && $limitations->can('settings.tab.'.($property->section ?? $namespace).'.'.$property->handle)) {
                    $add('form', $namespace, $property->handle, $settings->{$property->handle}, $property->label);
                }
            }
        }

        if ($limitations->can('layout.fields')) {
            foreach (FormFieldRecord::findAll(['formId' => $form->getId()]) as $record) {
                $field = $form->getLayout()->getFields()->get($record->uid);
                if (!$field || !$limitations->can('layout.fieldTypes', $field::class)) {
                    continue;
                }
                $metadata = JsonHelper::decode($record->metadata);
                foreach ($propertyProvider->getEditableProperties($field::class) as $property) {
                    if ($property->translatable && $property->visible && !$property->disabled && $property->matchesEdition()) {
                        $source = $metadata->{$property->handle} ?? $property->value;
                        $context = $field->getHandle().': '.$property->label;
                        if ('optionConfiguration' === $property->handle && 'custom' === ($source->source ?? null)) {
                            foreach ($source->options ?? [] as $option) {
                                if (isset($option->value) && \is_scalar($option->value)) {
                                    $add('fields', $record->uid, $property->handle, $option->label ?? null, $context, (string) $option->value);
                                }
                            }
                        } else {
                            $add('fields', $record->uid, $property->handle, $source, $context);
                        }
                    }
                }
            }
        }

        if ($limitations->can('layout.multiPageForms')) {
            foreach (FormPageRecord::findAll(['formId' => $form->getId()]) as $page) {
                $buttons = JsonHelper::decode($page->metadata)?->buttons;
                $add('pages', $page->uid, 'label', $page->label, 'Page name');
                foreach (['submitLabel', 'backLabel', 'saveLabel'] as $handle) {
                    $add('pages', $page->uid, $handle, $buttons->{$handle} ?? null, $page->label);
                }
            }
        }

        $revision = hash('sha256', json_encode([$form->getId(), $siteId, $strings], \JSON_THROW_ON_ERROR));

        return ['strings' => $strings, 'stored' => $stored, 'revision' => $revision];
    }
}
