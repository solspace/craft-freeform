<?php

namespace Solspace\Freeform\Services;

use craft\helpers\StringHelper;
use Solspace\Freeform\Bundles\Attributes\Form\SettingsProvider;
use Solspace\Freeform\Bundles\Attributes\Property\PropertyProvider;
use Solspace\Freeform\Bundles\Fields\Types\FieldTypesProvider;
use Solspace\Freeform\Bundles\Form\Limiting\LimitedUsers\LimitedUserChecker;
use Solspace\Freeform\Bundles\Translations\TranslationProvider;
use Solspace\Freeform\controllers\api\FormsController;
use Solspace\Freeform\Events\Forms\PersistFormEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Form\Layout\Layout;
use Solspace\Freeform\Form\Layout\Page;
use Solspace\Freeform\Form\Layout\Row;
use Solspace\Freeform\Form\Settings\Implementations\Options\FormattingTemplateOptions;
use Solspace\Freeform\Form\Settings\Settings;
use Solspace\Freeform\Form\Types\Regular;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\DataObjects\FormWizard\PresetCatalog;
use Solspace\Freeform\Library\DataObjects\FormWizard\PreviewForm;
use Solspace\Freeform\Library\Helpers\PermissionHelper;
use Solspace\Freeform\Library\Helpers\SitesHelper;
use Solspace\Freeform\Notifications\Types\Admin\Admin;
use Solspace\Freeform\Notifications\Types\EmailField\EmailField;
use yii\base\Event;

class FormWizardService
{
    public function __construct(
        private PropertyProvider $properties,
        private SettingsProvider $settings,
        private FieldTypesProvider $types,
        private LimitedUserChecker $limitations,
        private FormWizardNotificationService $notificationTemplates,
        private FormsService $forms,
        private TranslationProvider $translations,
        private PresetCatalog $catalog,
    ) {}

    public function options(): array
    {
        $available = [];
        foreach ($this->types->getTypes() as $type) {
            $short = array_search($type->typeClass, PresetCatalog::TYPES, true);
            if (false === $short || !$type->visible) {
                continue;
            }
            if ('file' === $short && !$this->uploadSource()) {
                continue;
            }
            $editableProperties = [];
            foreach ($type->properties as $property) {
                if ($property->visible && $property->matchesEdition() && !$property->disabled) {
                    $editableProperties[] = $property->handle;
                }
            }
            $available[] = ['value' => $short, 'label' => Freeform::t($type->name), 'editableProperties' => $editableProperties];
        }
        $defaults = [];
        $editable = [];
        $statuses = [];
        $successBehaviors = [];
        foreach ($this->settings->getSettingNamespaces() as $namespace) {
            foreach ($namespace->properties as $property) {
                $defaults[$namespace->handle][$property->handle] = $property->value;
                if ('general' === $namespace->handle && 'defaultStatus' === $property->handle) {
                    $statuses = $property->options?->toArray() ?? [];
                }
                if ('behavior' === $namespace->handle && 'successBehavior' === $property->handle) {
                    $successBehaviors = array_values(array_filter($property->options?->toArray() ?? [], static fn ($option) => \in_array($option['value'], ['reload', 'redirect-return-url', $property->value], true)));
                }
                if ($property->visible && $property->matchesEdition() && !$property->disabled
                    && $this->limitations->can('settings.tab.'.($property->section ?? 'general').'.'.$property->handle)) {
                    $editable[] = $property->handle;
                }
            }
        }
        $formattingTemplates = [];
        $formattingTemplateGroups = (new FormattingTemplateOptions(Freeform::getInstance()->settings))->fetchOptions(null)->toArray();
        foreach ($formattingTemplateGroups as $group) {
            foreach ($group['children'] as $template) {
                $formattingTemplates[$template['value']] = $template;
            }
        }
        $canNotify = PermissionHelper::checkPermission(Freeform::PERMISSION_NOTIFICATIONS_ACCESS) && $this->limitations->can('notifications.tab');
        $notificationOptions = $this->notificationTemplates->options($canNotify);

        return [
            'sitesEnabled' => SitesHelper::isEnabled(),
            'presets' => $this->catalog->getPresets(array_column($available, 'value')),
            'fieldTypes' => $available,
            'fieldLimit' => Freeform::getInstance()->edition()->is(Freeform::EDITION_EXPRESS) ? 20 : 100,
            'editableSettings' => $editable,
            'statuses' => $statuses,
            'successBehaviors' => $successBehaviors,
            'allowDashesInHandles' => Freeform::getInstance()->settings->isAllowDashesInFieldHandles(),
            'defaults' => [
                'description' => $defaults['general']['description'] ?? '',
                'color' => $defaults['general']['color'] ?? '',
                'defaultStatus' => (string) ($defaults['general']['defaultStatus'] ?? $statuses[0]['value'] ?? ''),
                'formattingTemplate' => $defaults['general']['formattingTemplate'] ?? $this->forms->getDefaultFormattingTemplate(),
                'storeData' => $defaults['general']['storeData'] ?? true,
                'successBehavior' => $defaults['behavior']['successBehavior'] ?? 'reload',
                'successMessage' => $defaults['behavior']['successMessage'] ?? '',
                'errorMessage' => $defaults['behavior']['errorMessage'] ?? '',
                'returnUrl' => $defaults['behavior']['returnUrl'] ?? '',
            ],
            'formattingTemplates' => array_values($formattingTemplates),
            'formattingTemplateGroups' => $formattingTemplateGroups,
            'notificationTemplates' => $notificationOptions['notificationTemplates'],
            'notificationTemplateMode' => $notificationOptions['notificationTemplateMode'],
            'notificationTemplateScope' => $notificationOptions['notificationTemplateScope'],
            'canCreateNotificationTemplates' => $notificationOptions['canCreateNotificationTemplates'],
            'canNotify' => $canNotify,
        ];
    }

    /** Only explicit wizard choices are accepted; arbitrary types/settings never reach persistence. */
    public function payload(array $input, bool $preview = false): \stdClass
    {
        $options = $this->options();
        $name = $this->text($input['name'] ?? '', 100);
        if ('' === $name && !$preview) {
            throw new \InvalidArgumentException(Freeform::t('Enter a name for your form.'));
        }
        $name = $name ?: Freeform::t('My Form');
        // Accept the original single-site draft format when an older tab is still open.
        $siteIds = \array_key_exists('siteIds', $input) ? $input['siteIds'] : [$input['siteId'] ?? SitesHelper::getCurrentCpPageSiteId() ?? \Craft::$app->sites->getCurrentSite()->id];
        $editableSiteIds = SitesHelper::getEditableSiteIds() ?? [];
        if (!\is_array($siteIds) || !$siteIds) {
            throw new \InvalidArgumentException(Freeform::t('Select at least one site you can edit.'));
        }
        foreach ($siteIds as $id) {
            if ((!\is_int($id) && !(\is_string($id) && ctype_digit($id))) || !\in_array((int) $id, $editableSiteIds, true)) {
                throw new \InvalidArgumentException(Freeform::t('Select at least one site you can edit.'));
            }
        }
        $siteIds = array_values(array_unique(array_map('intval', $siteIds)));
        if (\count($siteIds) > 1 && !$options['sitesEnabled']) {
            throw new \InvalidArgumentException(Freeform::t('Select a single site when multi-site support is disabled.'));
        }
        $purpose = $this->text($input['purpose'] ?? '', 40);
        $preset = array_column($options['presets'], null, 'id')[$purpose] ?? null;
        if (!$preset) {
            throw new \InvalidArgumentException(Freeform::t('Choose a purpose for your form.'));
        }
        $definitions = array_column($preset['fields'], null, 'key');
        $fields = $input['fields'] ?? [];
        if (!\is_array($fields) || !$fields || \count($fields) > $options['fieldLimit']) {
            throw new \InvalidArgumentException(Freeform::t('Choose between 1 and {count} fields.', ['count' => $options['fieldLimit']]));
        }
        $fields = array_values($fields);
        $handle = StringHelper::camelCase(StringHelper::toAscii($name)) ?: 'form';
        if (\in_array('handle', $options['editableSettings'], true) && isset($input['handle']) && '' !== $input['handle']) {
            $handle = $this->text($input['handle'], 100);
            if (!preg_match(($options['allowDashesInHandles'] ?? false) ? '/^[a-zA-Z0-9_-]+$/D' : '/^[a-zA-Z0-9_]+$/D', $handle)) {
                throw new \InvalidArgumentException(Freeform::t('Enter a valid form handle using letters, numbers, and underscores.'));
            }
        }
        $general = ['name' => $name, 'handle' => $handle, 'type' => Regular::class, 'sites' => $siteIds];
        $behavior = [];
        foreach ($options['defaults'] as $key => $default) {
            if (!\array_key_exists($key, $input) || !\in_array($key, $options['editableSettings'], true)) {
                continue;
            }
            $value = $input[$key];
            if ('storeData' === $key) {
                if (!\is_bool($value)) {
                    throw new \InvalidArgumentException(Freeform::t('Choose whether to save submissions.'));
                }
            } elseif ('defaultStatus' === $key) {
                if ((!\is_int($value) && !\is_string($value)) || !\in_array((string) $value, array_column($options['statuses'] ?? [], 'value'), true)) {
                    throw new \InvalidArgumentException(Freeform::t('Choose an available default status.'));
                }
                $value = (int) $value;
            } else {
                $value = $this->text($value, \in_array($key, ['successMessage', 'errorMessage'], true) ? 2000 : 500);
            }
            if ('color' === $key && !preg_match('/^#[a-fA-F0-9]{6}$/D', $value)) {
                throw new \InvalidArgumentException(Freeform::t('Enter a form color in #RRGGBB format.'));
            }
            if ('formattingTemplate' === $key && '' !== $value && $value !== $default && !\in_array($value, array_column($options['formattingTemplates'], 'value'), true)) {
                throw new \InvalidArgumentException(Freeform::t('Choose an available formatting template.'));
            }
            if ('successBehavior' === $key && $value !== $default && !\in_array($value, ['reload', 'redirect-return-url'], true)) {
                throw new \InvalidArgumentException(Freeform::t('Choose a supported submission behavior.'));
            }
            if (\in_array($key, ['formattingTemplate', 'storeData', 'description', 'color', 'defaultStatus'], true)) {
                $general[$key] = $value;
            } else {
                $behavior[$key] = $value;
            }
        }
        $general['formattingTemplate'] ??= $options['defaults']['formattingTemplate'];
        if ('redirect-return-url' === ($behavior['successBehavior'] ?? $options['defaults']['successBehavior'])) {
            $url = $behavior['returnUrl'] ?? $options['defaults']['returnUrl'];
            if (!preg_match('~^/(?!/)|^https?://[^\s]+$~i', $url) || preg_match('/[\x00-\x20\\\{}]/', $url)) {
                throw new \InvalidArgumentException(Freeform::t('Enter a redirect URL beginning with /, https://, or http://.'));
            }
        }
        $layoutUid = StringHelper::UUID();
        $rows = [];
        $persistFields = [];
        $keys = [];
        $explicitRows = (bool) array_filter($input['fields'], static fn ($field) => isset($field['rowId']));
        $seenRows = [];
        $rowWidth = null;
        $rowSize = 0;
        foreach ($fields as $index => $field) {
            if (!\is_array($field)) {
                throw new \InvalidArgumentException(Freeform::t('Review the selected fields.'));
            }
            $key = $this->text($field['key'] ?? '', 60);
            $type = $field['type'] ?? '';
            if (!\in_array($type, array_column($options['fieldTypes'], 'value'), true)
                || !preg_match('/^[a-zA-Z][a-zA-Z0-9]*$/', $key) || isset($keys[$key])) {
                throw new \InvalidArgumentException(Freeform::t('A selected field is unavailable. Reopen guided setup and try again.'));
            }
            $keys[$key] = true;
            $class = PresetCatalog::TYPES[$type];
            $label = $this->text($field['label'] ?? '', 200);
            if ('' === $label) {
                throw new \InvalidArgumentException(Freeform::t('Give every field a label.'));
            }
            $props = $this->fieldDefaults($class);
            $suggested = $definitions[$key] ?? [];
            $props = array_replace($props, ['label' => $label, 'handle' => 'field'.$index, 'required' => true === ($field['required'] ?? false)]);
            // Stable preset handles are readable; user-added fields get safe generated handles.
            $props['handle'] = isset($definitions[$key]) ? $key : 'customField'.$index;
            $props['instructions'] = $this->text($field['instructions'] ?? ($suggested['instructions'] ?? ''), 500);
            $props['browserAutofill'] = match ($key) {
                'firstName' => 'given-name', 'lastName' => 'family-name', 'email' => 'email',
                'phone' => 'tel', 'company', 'organization' => 'organization', 'website', 'portfolio' => 'url', default => '',
            };
            if ('phone' === $type) {
                $props['international'] = false;
                $props['allowedCountries'] = '';
                $props['pattern'] = null;
                $props['useJsMask'] = false;
            }
            if ('datetime' === $type) {
                $props['dateTimeType'] = 'date';
                $props['useDatepicker'] = true;
                $props['initialValue'] = '';
            }
            if ('rating' === $type) {
                $props['maxValue'] = 5;
                $props['defaultValue'] = '';
            }
            if ('number' === $type) {
                $props['allowNegative'] = false;
                $props['decimalCount'] = 0;
                $props['minMaxValues'] = ['attendees' === $key ? 1 : 0, null];
            }
            if ('file' === $type) {
                $props['assetSourceId'] = $this->uploadSource();
                $props['fileKinds'] = ['pdf'];
                $props['maxFileSizeKB'] = 5120;
                $props['fileCount'] = 1;
                $props['showUploadRequirements'] = true;
            }
            if (\in_array($type, ['dropdown', 'radios', 'checkboxes'], true)) {
                $choices = $field['options'] ?? [];
                if (!\is_array($choices) || !\count($choices) || \count($choices) > 50) {
                    throw new \InvalidArgumentException(Freeform::t('Add between 1 and 50 choices to each choice field.'));
                }
                $choices = array_map(fn ($choice) => $this->text($choice, 150), $choices);
                if (\in_array('', $choices, true) || \count(array_unique($choices)) !== \count($choices)) {
                    throw new \InvalidArgumentException(Freeform::t('Give each choice a unique, nonempty label.'));
                }
                $props['optionConfiguration'] = ['source' => 'custom', 'useCustomValues' => false, 'options' => array_map(static fn ($choice) => ['label' => $choice, 'value' => $choice, 'optgroup' => false], $choices)];
                if ('dropdown' === $type) {
                    $props['optionConfiguration']['emptyOption'] = Freeform::t('Please select');
                    $props['defaultValue'] = '';
                }
                if ('radios' === $type) {
                    $props['oneLine'] = true;
                }
            }
            // Keep only properties exposed by this edition; fallback fields cannot retain Pro settings.
            $props = array_intersect_key($props, $this->fieldDefaults($class));
            foreach ($this->properties->getEditableProperties($class) as $property) {
                if (!$property->visible || $property->disabled) {
                    $props[$property->handle] = $property->value;
                }
            }
            $width = $field['width'] ?? 'full';
            $columns = ['full' => 1, 'half' => 2, 'third' => 3, 'quarter' => 4];
            if ($explicitRows) {
                $width = $field['rowId'] ?? null;
                if (!\is_string($width) || !preg_match('/^[a-zA-Z0-9_-]{1,80}$/D', $width) || ($rowWidth !== $width && isset($seenRows[$width])) || ($rowWidth === $width && $rowSize >= 4)) {
                    throw new \InvalidArgumentException(Freeform::t('Choose a valid row layout with up to four fields per row.'));
                }
            } elseif (!\is_string($width) || !isset($columns[$width])) {
                throw new \InvalidArgumentException(Freeform::t('Choose a supported field width.'));
            }
            if ($rowWidth !== $width || (!$explicitRows && $rowSize >= $columns[$width])) {
                $rows[] = (object) ['uid' => StringHelper::UUID(), 'layoutUid' => $layoutUid, 'order' => \count($rows)];
                $rowWidth = $width;
                $seenRows[$width] = true;
                $rowSize = 0;
            }
            ++$rowSize;
            $persistFields[] = (object) ['uid' => StringHelper::UUID(), 'rowUid' => end($rows)->uid, 'typeClass' => $class, 'order' => $index, 'properties' => (object) $props];
        }
        $payload = (object) [
            'form' => (object) ['uid' => StringHelper::UUID(), 'type' => Regular::class, 'settings' => (object) ['general' => (object) $general, 'behavior' => (object) $behavior]],
            'layout' => (object) [
                'layouts' => [(object) ['uid' => $layoutUid]],
                'pages' => [(object) ['uid' => StringHelper::UUID(), 'layoutUid' => $layoutUid, 'order' => 0, 'label' => Freeform::t('Page 1'), 'buttons' => (object) ['layout' => 'submit', 'submitLabel' => Freeform::t('Submit'), 'back' => false, 'save' => false]]],
                'rows' => $rows, 'fields' => $persistFields,
            ],
        ];
        if (!$preview) {
            $payload->notifications = $this->notifications($input, $options, $persistFields);
        }

        return $payload;
    }

    public function create(array $input): Form
    {
        $payload = $this->payload($input);
        $event = new PersistFormEvent($payload);
        $transaction = \Craft::$app->db->beginTransaction();
        $createdTemplates = [];

        try {
            Event::trigger(FormsController::class, FormsController::EVENT_CREATE_FORM, $event);
            if (!$event->hasErrors() && $event->getForm()) {
                foreach ($payload->notifications as $notification) {
                    if ($notification->createTemplate ?? false) {
                        $template = $this->notificationTemplates->create($event->getForm(), Admin::class === $notification->className ? 'admin' : 'confirmation');
                        $createdTemplates[] = $template;
                        $notification->template = $template->filepath ?: $template->id;
                        unset($notification->createTemplate);
                    }
                }
                // Upsert listeners (including notifications) require the newly assigned form ID.
                $event = (new PersistFormEvent($payload, $event->getForm()->getId()))->setForm($event->getForm());
                Event::trigger(FormsController::class, FormsController::EVENT_UPSERT_FORM, $event);
            }
            if ($event->hasErrors() || !$event->getForm()) {
                throw new \InvalidArgumentException(Freeform::t('The form could not be saved. Review your choices and your edition limits.'));
            }
            Event::trigger(FormsController::class, FormsController::EVENT_AFTER_SAVE_FORM, $event);
            $transaction->commit();

            return $event->getForm();
        } catch (\Throwable $exception) {
            $transaction->rollBack();
            foreach ($createdTemplates as $template) {
                $this->notificationTemplates->remove($template);
            }
            // Submission-table DDL can commit implicitly on MySQL.
            if ($id = $event->getForm()?->getId()) {
                $this->forms->deleteById($id);
            }

            throw $exception;
        }
    }

    public function preview(array $input): Form
    {
        $payload = $this->payload($input, true);
        $settings = [];
        foreach ($this->settings->getSettingNamespaces() as $namespace) {
            foreach ($namespace->properties as $property) {
                $settings[$namespace->handle][$property->handle] = $payload->form->settings->{$namespace->handle}->{$property->handle} ?? $property->value;
            }
        }
        $currentSiteId = SitesHelper::getCurrentCpPageSiteId();
        $site = \Craft::$app->sites->getSiteById(\in_array($currentSiteId, $settings['general']['sites'], true) ? $currentSiteId : $settings['general']['sites'][0]);
        // Defaults use editor DTOs; stored settings/attribute transformers expect arrays.
        $settings = json_decode(json_encode($settings), true);
        $form = new PreviewForm(['uid' => $payload->form->uid, 'siteId' => $site->id, 'siteHandle' => $site->handle], new Settings($settings, $this->properties), $this->translations);
        $form->setPreviewSuccess(true === ($input['previewSuccess'] ?? false) && 'reload' === $settings['behavior']['successBehavior']);
        $form->setPreviewError(true === ($input['previewError'] ?? false));
        $layout = new Layout($payload->layout->layouts[0]->uid);
        $page = new Page($form, $this->properties, $this->translations, $layout, ['uid' => $payload->layout->pages[0]->uid, 'label' => Freeform::t('Page 1'), 'metadata' => ['buttons' => (array) $payload->layout->pages[0]->buttons]]);
        $form->getLayout()->getPages()->add($page);
        foreach ($payload->layout->rows as $rowData) {
            $row = new Row(['uid' => $rowData->uid, 'index' => $rowData->order]);
            foreach ($payload->layout->fields as $data) {
                if ($data->rowUid !== $rowData->uid) {
                    continue;
                }
                $field = new ($data->typeClass)($form);
                // Render-option stacks are keyed by field ID. Unsaved fields need
                // distinct temporary IDs so their classes and attributes stay isolated.
                $fieldProperties = json_decode(json_encode($data->properties), true);
                $this->properties->setObjectProperties($field, array_merge($fieldProperties, ['id' => -($data->order + 1), 'uid' => $data->uid, 'rowUid' => $rowData->uid, 'order' => $data->order]), form: $form);
                if (true === ($input['previewError'] ?? false) && $field->isRequired()) {
                    $field->addError($field->getRequiredErrorMessage() ?: Freeform::t('This field is required'));
                }
                $field->setPageIndex(0);
                $field->setValue($data->typeClass === PresetCatalog::TYPES['checkboxes'] ? [] : null);
                $row->getFields()->add($field);
                $row->getAllFields()->add($field);
                $layout->getFields()->add($field);
                $form->getLayout()->getFields()->add($field);
            }
            $layout->getRows()->add($row);
            $layout->getAllRows()->add($row);
        }

        return $form;
    }

    private function notifications(array $input, array $options, array $fields): array
    {
        $notifications = [];
        foreach (['admin', 'confirmation'] as $kind) {
            if (true !== ($input[$kind.'Enabled'] ?? false)) {
                continue;
            }
            if (!$options['canNotify']) {
                throw new \InvalidArgumentException(Freeform::t('You do not have permission to configure notifications.'));
            }
            $template = $input[$kind.'Template'] ?? '';
            $createTemplate = true === ($input[$kind.'NewTemplate'] ?? false);
            if ($createTemplate && !$options['canCreateNotificationTemplates']) {
                throw new \InvalidArgumentException(Freeform::t('Creating notification templates is unavailable for this account or site.'));
            }
            if (!$createTemplate && !\in_array((string) $template, array_column($options['notificationTemplates'], 'value'), true)) {
                throw new \InvalidArgumentException(Freeform::t('Select an email template for each notification.'));
            }
            $notification = (object) ['uid' => StringHelper::UUID(), 'name' => Freeform::t('admin' === $kind ? 'Team notification' : 'Visitor confirmation'), 'enabled' => true, 'template' => $createTemplate ? null : $template, 'createTemplate' => $createTemplate, 'className' => 'admin' === $kind ? Admin::class : EmailField::class];
            if ('admin' === $kind) {
                $email = $this->text($input['adminEmail'] ?? '', 254);
                if (!filter_var($email, \FILTER_VALIDATE_EMAIL)) {
                    throw new \InvalidArgumentException(Freeform::t('Enter a valid team email address.'));
                }
                $notification->recipients = [['email' => $email, 'name' => '']];
            } else {
                $match = array_filter($fields, static fn ($field) => PresetCatalog::TYPES['email'] === $field->typeClass && $field->properties->handle === ($input['confirmationField'] ?? ''));
                if (!$match) {
                    throw new \InvalidArgumentException(Freeform::t('Choose an Email field for the visitor confirmation.'));
                }
                $notification->field = reset($match)->uid;
            }
            $notifications[] = $notification;
        }

        return $notifications;
    }

    private function fieldDefaults(string $class): array
    {
        $defaults = [];
        foreach ($this->properties->getEditableProperties($class) as $property) {
            if ($property->matchesEdition()) {
                $defaults[$property->handle] = $property->value;
            }
        }

        return $defaults;
    }

    private function uploadSource(): ?int
    {
        $defaults = $this->fieldDefaults(PresetCatalog::TYPES['file']);
        $source = $defaults['assetSourceId'] ?? null;
        $volume = $source ? \Craft::$app->volumes->getVolumeById($source) : null;

        return $volume && \Craft::$app->user->checkPermission('saveAssets:'.$volume->uid) ? $volume->id : null;
    }

    private function text(mixed $value, int $max): string
    {
        if (!\is_string($value) || mb_strlen($value) > $max) {
            throw new \InvalidArgumentException(Freeform::t('A value is missing or too long. Review your choices.'));
        }

        return trim(strip_tags($value));
    }
}
