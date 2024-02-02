<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;
use craft\db\Query;
use craft\helpers\StringHelper;
use Solspace\Commons\Helpers\StringHelper as FreeformStringHelper;
use Solspace\Freeform\Attributes\Field\Type;
use Solspace\Freeform\Fields\Interfaces\NoStorageInterface;
use Solspace\Freeform\Library\Helpers\AttributeHelper;
use Solspace\Freeform\Library\Helpers\HashHelper;
use Solspace\Freeform\Library\Rules\Condition;
use Solspace\Freeform\Library\Rules\Rule;
use Solspace\Freeform\Records\Form\FormFieldRecord;
use Solspace\Freeform\Records\Form\FormLayoutRecord;
use Solspace\Freeform\Records\Form\FormNotificationRecord;
use Solspace\Freeform\Records\Form\FormPageRecord;
use Solspace\Freeform\Records\Form\FormRowRecord;
use Solspace\Freeform\Records\FormRecord;
use Solspace\Freeform\Records\Rules\FieldRuleRecord;
use Solspace\Freeform\Records\Rules\PageRuleRecord;
use Solspace\Freeform\Records\Rules\RuleConditionRecord;
use Solspace\Freeform\Records\Rules\RuleRecord;

class m230101_200000_FF4to5_MigrateData extends Migration
{
    private const IGNORED_FIELD_TYPES = [
        'cc_details',
        'cc_number',
        'cc_expiry',
        'cc_cvc',
        'recaptcha',
        'submit',
        'save',
    ];

    private array $pageMap = [];
    private array $fieldMap = [];

    private array $globalFieldData = [];

    public function safeUp(): bool
    {
        $this->migrateLayoutData();

        return true;
    }

    public function safeDown(): bool
    {
        echo "m230101_200000_FF4to5_MigrateData cannot be reverted.\n";

        return false;
    }

    private function migrateLayoutData(): void
    {
        $layouts = (new Query())
            ->select('layoutJson')
            ->from(FormRecord::TABLE)
            ->indexBy('id')
            ->column()
        ;

        $this->globalFieldData = (new Query())
            ->select('*')
            ->from('{{%freeform_fields}}')
            ->indexBy('id')
            ->all()
        ;

        $this->renameOldFieldColumns();

        foreach ($layouts as $formId => $layoutJson) {
            $composer = json_decode($layoutJson)->composer;

            $properties = $composer->properties;
            $layoutData = $composer->layout;

            $pageOrder = 0;
            foreach ($layoutData as $pageIndex => $pageData) {
                $pageProps = $properties->{'page'.$pageIndex};

                $defaultMetadata = ['buttons' => $this->processPageButtonData($pageData, $properties)];

                $layout = new FormLayoutRecord([
                    'formId' => $formId,
                    'uid' => StringHelper::UUID(),
                ]);
                $layout->save();

                $pageRecord = new FormPageRecord([
                    'formId' => $formId,
                    'layoutId' => $layout->id,
                    'label' => $pageProps->label,
                    'order' => $pageOrder++,
                    'metadata' => $defaultMetadata,
                    'uid' => StringHelper::UUID(),
                ]);
                $pageRecord->save();

                $this->pageMap['page'.$pageIndex] = $pageRecord;

                $rowOrder = 0;
                foreach ($pageData as $rowData) {
                    $row = new FormRowRecord([
                        'formId' => $formId,
                        'layoutId' => $layout->id,
                        'order' => $rowOrder++,
                        'uid' => StringHelper::UUID(),
                    ]);
                    $row->save();

                    $hasFields = false;
                    $fieldOrder = 0;
                    foreach ($rowData->columns as $fieldHash) {
                        $props = $properties->{$fieldHash};

                        if (\in_array($props->type, self::IGNORED_FIELD_TYPES)) {
                            continue;
                        }

                        $fieldClass = $this->getFieldClass($props);
                        if (\in_array($props->type, ['html', 'rich_text', 'mailing_list'])) {
                            $props->handle = $fieldHash;
                        }

                        $metadata = $this->extractMetadata($fieldClass, $props);

                        $field = new FormFieldRecord([
                            'formId' => $formId,
                            'rowId' => $row->id,
                            'order' => $fieldOrder++,
                            'type' => $fieldClass,
                            'metadata' => $metadata,
                            'uid' => StringHelper::UUID(),
                        ]);
                        $field->save();

                        $this->fieldMap[$fieldHash] = $field;

                        $this->renameDatabaseColumn($formId, $field, $props);

                        $this->processDynamicNotifications($field, $props);
                        $this->processEmailNotifications($field, $props);

                        $hasFields = true;
                    }

                    if (!$hasFields) {
                        $row->delete();
                    }
                }
            }

            $this->processAdminNotifications($formId, $properties->admin_notifications ?? null);
            $this->processRules($formId, $properties);
        }
    }

    private function getFieldClass(\stdClass $data): string
    {
        $type = $data->type;

        if ('dynamic_recipients' === $type) {
            if ($data->showAsRadio) {
                return 'Solspace\Freeform\Fields\Implementations\RadiosField';
            }

            if ($data->showAsCheckboxes) {
                return 'Solspace\Freeform\Fields\Implementations\CheckboxesField';
            }

            return 'Solspace\Freeform\Fields\Implementations\DropdownField';
        }

        if ('mailing_list' === $type) {
            if ($data->hidden ?? false) {
                return 'Solspace\Freeform\Fields\Implementations\HiddenField';
            }

            return 'Solspace\Freeform\Fields\Implementations\CheckboxField';
        }

        return match ($type) {
            'email' => 'Solspace\Freeform\Fields\Implementations\EmailField',
            'textarea' => 'Solspace\Freeform\Fields\Implementations\TextareaField',
            'checkbox' => 'Solspace\Freeform\Fields\Implementations\CheckboxField',
            'checkbox_group' => 'Solspace\Freeform\Fields\Implementations\CheckboxesField',
            'radio_group' => 'Solspace\Freeform\Fields\Implementations\RadiosField',
            'select' => 'Solspace\Freeform\Fields\Implementations\DropdownField',
            'multiple_select' => 'Solspace\Freeform\Fields\Implementations\MultipleSelectField',
            'number' => 'Solspace\Freeform\Fields\Implementations\NumberField',
            'file' => 'Solspace\Freeform\Fields\Implementations\FileUploadField',
            'file_drag_and_drop' => 'Solspace\Freeform\Fields\Implementations\Pro\FileDragAndDropField',
            'hidden' => 'Solspace\Freeform\Fields\Implementations\HiddenField',
            'invisible' => 'Solspace\Freeform\Fields\Implementations\Pro\InvisibleField',
            'html' => 'Solspace\Freeform\Fields\Implementations\HtmlField',
            'rich_text' => 'Solspace\Freeform\Fields\Implementations\Pro\RichTextField',
            'confirmation' => 'Solspace\Freeform\Fields\Implementations\Pro\ConfirmationField',
            'datetime' => 'Solspace\Freeform\Fields\Implementations\Pro\DatetimeField',
            'opinion_scale' => 'Solspace\Freeform\Fields\Implementations\Pro\OpinionScaleField',
            'password' => 'Solspace\Freeform\Fields\Implementations\Pro\PasswordField',
            'phone' => 'Solspace\Freeform\Fields\Implementations\Pro\PhoneField',
            'rating' => 'Solspace\Freeform\Fields\Implementations\Pro\RatingField',
            'regex' => 'Solspace\Freeform\Fields\Implementations\Pro\RegexField',
            'signature' => 'Solspace\Freeform\Fields\Implementations\Pro\SignatureField',
            'table' => 'Solspace\Freeform\Fields\Implementations\Pro\TableField',
            'website' => 'Solspace\Freeform\Fields\Implementations\Pro\WebsiteField',
            default => 'Solspace\Freeform\Fields\Implementations\TextField',
        };
    }

    private function extractMetadata(string $fieldClass, \stdClass $data): array
    {
        $defaultValue = $data->value ?? null;
        if (\in_array($data->type, ['checkbox_group', 'multiple_select'])) {
            $defaultValue = $data->values ?? [];
            if (\is_string($defaultValue)) {
                if (empty($defaultValue)) {
                    $defaultValue = [];
                } else {
                    $defaultValue = [$defaultValue];
                }
            }
        }

        $label = $data->label ?? '';
        $handle = $data->handle ?? $data->type.'_'.HashHelper::sha1(random_bytes(10).microtime(), 5);

        if (!$label) {
            $globalField = $this->globalFieldData[$data->id ?? 0] ?? null;
            if ($globalField) {
                $label = $globalField['label'] ?? '';
            }

            if (!$label) {
                $reflection = new \ReflectionClass($fieldClass);
                $type = AttributeHelper::findAttribute($reflection, Type::class);
                $label = $type->name;
            }
        }

        $base = [
            'label' => $label,
            'handle' => $handle,
            'required' => (bool) ($data->required ?? false),
            'instructions' => $data->instructions ?? '',
            'defaultValue' => $defaultValue,
            'encrypted' => false,
            'attributes' => [
                'input' => $this->parseAttributes($data->inputAttributes ?? []),
                'container' => [],
                'label' => $this->parseAttributes($data?->labelAttributes ?? []),
                'error' => $this->parseAttributes($data?->errorAttributes ?? []),
                'instructions' => $this->parseAttributes($data->instructionAttributes ?? []),
            ],
        ];

        $extra = array_filter([
            // Generic
            'placeholder' => $data->placeholder ?? null,
            // Checkbox
            'checkedByDefault' => (bool) ($data->checked ?? null),
            // Options
            'options' => $data->options ?? null,
            'oneLine' => $data->oneLine ?? null,
            // File
            'assetSourceId' => $data->assetSourceId ?? null,
            'fileKinds' => $data->fileKinds ?? null,
            'maxFileSizeKB' => $data->maxFileSizeKB ?? null,
            'fileCount' => $data->fileCount ?? null,
            'defaultUploadLocation' => $data->defaultUploadLocation ?? null,
            // File Drag & Drop
            'accent' => $data->accent ?? null,
            'theme' => $data->theme ?? null,
            // Textarea
            'rows' => $data->rows ?? null,
            // Date
            'dateTimeType' => $data->dateTimeType ?? null,
            'initialValue' => $data->initialValue ?? null,
            'locale' => $data->locale ?? null,
            'useDatepicker' => $data->useDatepicker ?? null,
            'generatePlaceholder' => $data->generatePlaceholder ?? null,
            'dateOrder' => $data->dateOrder ?? null,
            'date4DigitYear' => $data->date4DigitYear ?? null,
            'dateLeadingZero' => $data->dateLeadingZero ?? null,
            'dateSeparator' => $data->dateSeparator ?? null,
            'minDate' => $data->minDate ?? null,
            'maxDate' => $data->maxDate ?? null,
            'clock24h' => $data->clock24h ?? null,
            'clockSeparator' => $data->clockSeparator ?? null,
            'clockAMPMSeparate' => $data->clockAMPMSeparate ?? null,
            // Rating
            'colorIdle' => $data->colorIdle ?? null,
            'colorHover' => $data->colorHover ?? null,
            'colorSelected' => $data->colorSelected ?? null,
            // Signature
            'width' => $data->width ?? null,
            'height' => $data->height ?? null,
            'showClearButton' => $data->showClearButton ?? null,
            'borderColor' => $data->borderColor ?? null,
            'backgroundColor' => $data->backgroundColor ?? null,
            'penColor' => $data->penColor ?? null,
            'penDotSize' => $data->penDotSize ?? null,
            // Table
            'maxRows' => $data->maxRows ?? null,
            'tableLayout' => $data->tableLayout ?? null,
            'useScript' => $data->useScript ?? null,
            // Regex
            'pattern' => $data->pattern ?? null,
            'message' => $data->message ?? null,
            // Phone
            'useJsMask' => $data->useScript ?? null,
            // Number
            'step' => $data->step ?? null,
            'decimalCount' => $data->decimalCount ?? null,
            'allowNegative' => $data->allowNegative ?? null,
            // HTML
            'twig' => $data->twig ?? null,
            'content' => $data->content ?? null, // TODO: pull this from the default value if HTML field
            // Website
            'url' => $data->url ?? null,
        ]);

        $exceptions = $this->processFieldExceptions($data);

        return array_merge($base, $extra, $exceptions);
    }

    private function processFieldExceptions(\stdClass $data): array
    {
        return match ($data->type) {
            'select', 'checkbox_group', 'radio_group', 'multiple_select' => $this->processOptions($data),
            'opinion_scale' => $this->processOpinionScale($data),
            'dynamic_recipients' => $this->processDynamicRecipients($data),
            'rich_text', 'html' => [
                'content' => $data->value ?? '',
            ],
            'number' => [
                'minMaxValues' => [$data->minValue ?? null, $data->maxValue ?? null],
            ],
            'confirmation' => [
                'targetField' => $this->fieldMap[$data->targetFieldHash]?->uid ?? null,
            ],
            'mailing_list' => [
                'checkedByDefault' => (bool) ($data->value ?? false),
            ],
            default => [],
        };
    }

    private function processOpinionScale(\stdClass $data): array
    {
        return [
            'scales' => array_map(
                fn ($scale) => [$scale->value ?? '', $scale->label ?? ''],
                $data->scales ?? [],
            ),
            'legends' => array_map(
                fn ($legend) => [$legend->legend ?? ''],
                $data->legends ?? [],
            ),
        ];
    }

    private function processOptions(\stdClass $data): array
    {
        $configuration = $data->configuration ?? new \stdClass();
        $source = $data->source ?? null;

        return match ($source) {
            'entries' => [
                'optionConfiguration' => [
                    'source' => 'elements',
                    'typeClass' => 'Solspace\Freeform\Fields\Properties\Options\Elements\Types\Entries\Entries',
                    'properties' => [
                        'sort' => $configuration->sort ?? 'asc',
                        'label' => $configuration->label ?? 'title',
                        'value' => $configuration->value ?? 'id',
                        'siteId' => $configuration->siteId ?? null,
                        'orderBy' => $configuration->orderBy ?? 'id',
                        'sectionId' => $configuration->sectionId ?? null,
                        'entryTypeId' => $data->target ?? null,
                    ],
                ],
            ],
            'categories' => [
                'optionConfiguration' => [
                    'source' => 'elements',
                    'typeClass' => 'Solspace\Freeform\Fields\Properties\Options\Elements\Types\Categories\Categories',
                    'properties' => [
                        'sort' => $configuration->sort ?? 'asc',
                        'label' => $configuration->label ?? 'title',
                        'value' => $configuration->value ?? 'id',
                        'siteId' => $configuration->siteId ?? null,
                        'orderBy' => $configuration->orderBy ?? 'id',
                        'groupId' => $data->target ?? null,
                    ],
                ],
            ],
            'users' => [
                'optionConfiguration' => [
                    'source' => 'elements',
                    'typeClass' => 'Solspace\Freeform\Fields\Properties\Options\Elements\Types\Users\Users',
                    'properties' => [
                        'sort' => $configuration->sort ?? 'asc',
                        'label' => $configuration->label ?? 'username',
                        'value' => $configuration->value ?? 'id',
                        'siteId' => $configuration->siteId ?? null,
                        'orderBy' => $configuration->orderBy ?? 'id',
                        'groupId' => $data->target ?? null,
                    ],
                ],
            ],
            'tags' => [
                'optionConfiguration' => [
                    'source' => 'elements',
                    'typeClass' => 'Solspace\Freeform\Fields\Properties\Options\Elements\Types\Tags\Tags',
                    'properties' => [
                        'sort' => $configuration->sort ?? 'asc',
                        'label' => $configuration->label ?? 'title',
                        'value' => $configuration->value ?? 'id',
                        'siteId' => $configuration->siteId ?? null,
                        'orderBy' => $configuration->orderBy ?? 'id',
                        'groupId' => $data->target ?? null,
                    ],
                ],
            ],
            'predefined' => [
                'optionConfiguration' => array_merge(
                    ['source' => 'predefined'],
                    $this->getPredefinedOptionConfiguration($data),
                ),
            ],
            default => [
                'optionConfiguration' => [
                    'source' => 'custom',
                    'options' => $data->options ?? [],
                    'useCustomValues' => $data->showCustomValues ?? false,
                ],
            ],
        };
    }

    private function processDynamicRecipients(\stdClass $data): array
    {
        $selectedEmail = $data->value ?? '';
        if ($data->showAsCheckboxes) {
            $selectedEmail = $data->values ?? [];
        }

        $emailIndexes = [];
        $options = [];
        $iterator = 1;
        foreach ($data->options as $option) {
            $emailIndexes[$option->value] = $option->label;

            $options[] = [
                'value' => $option->label,
                'label' => $option->label,
            ];

            ++$iterator;
        }

        if (\is_string($selectedEmail)) {
            $selectedEmail = $emailIndexes[$selectedEmail] ?? '';
        } else {
            $selectedEmail = array_filter(
                array_map(
                    fn ($email) => $emailIndexes[$email] ?? null,
                    $selectedEmail,
                )
            );
        }

        return [
            'defaultValue' => $selectedEmail,
            'optionConfiguration' => [
                'source' => 'custom',
                'options' => $options,
                'useCustomValues' => false,
            ],
        ];
    }

    private function getPredefinedOptionConfiguration(\stdClass $data): array
    {
        $target = $data->target;

        $configuration = $data->configuration ?? new \stdClass();

        switch ($target) {
            case 'numbers':
                return [
                    'typeClass' => 'Solspace\\Freeform\\Fields\\Properties\\Options\\Predefined\\Types\\Numbers\\Numbers',
                    'properties' => [
                        'step' => 1,
                        'first' => $configuration->start ?? 0,
                        'second' => $configuration->end ?? 20,
                    ],
                ];

            case 'years':
                return [
                    'typeClass' => 'Solspace\Freeform\Fields\Properties\Options\Predefined\Types\Years\Years',
                    'properties' => [
                        'first' => $configuration->start ?? 100,
                        'last' => $configuration->end ?? 0,
                    ],
                ];

            case 'months':
                $value = match ($configuration->valueType) {
                    'int' => 'single',
                    'int_w_zero' => 'double',
                    default => $configuration->valueType,
                };

                $label = match ($configuration->listType) {
                    'int' => 'single',
                    'int_w_zero' => 'double',
                    default => $configuration->listType,
                };

                return [
                    'typeClass' => 'Solspace\Freeform\Fields\Properties\Options\Predefined\Types\Months\Months',
                    'properties' => [
                        'value' => $value,
                        'label' => $label,
                    ],
                ];

            case 'days':
                $value = match ($configuration->valueType) {
                    'int' => 'single',
                    'int_w_zero' => 'double',
                    default => $configuration->valueType,
                };

                $label = match ($configuration->listType) {
                    'int' => 'single',
                    'int_w_zero' => 'double',
                    default => $configuration->listType,
                };

                return [
                    'typeClass' => 'Solspace\Freeform\Fields\Properties\Options\Predefined\Types\Days\Days',
                    'properties' => [
                        'value' => $value,
                        'label' => $label,
                    ],
                ];

            case 'days_of_week':
                return [
                    'typeClass' => 'Solspace\Freeform\Fields\Properties\Options\Predefined\Types\DaysOfWeek\DaysOfWeek',
                    'properties' => [
                        'value' => $configuration->valueType ?? 'full',
                        'label' => $configuration->listType ?? 'full',
                    ],
                ];

            case 'provinces':
            case 'provinces_fr':
            case 'provinces_bil':
                $language = match ($target) {
                    'provinces_fr' => 'fr',
                    'provinces_bil' => 'bi',
                    default => 'en',
                };

                return [
                    'typeClass' => 'Solspace\Freeform\Fields\Properties\Options\Predefined\Types\Provinces\Provinces',
                    'properties' => [
                        'value' => $configuration->valueType ?? 'abbreviated',
                        'label' => $configuration->listType ?? 'full',
                        'language' => $language,
                    ],
                ];

            case 'countries':
                return [
                    'typeClass' => 'Solspace\Freeform\Fields\Properties\Options\Predefined\Types\Countries\Countries',
                    'properties' => [
                        'value' => $configuration->valueType ?? 'abbreviated',
                        'label' => $configuration->listType ?? 'full',
                    ],
                ];

            case 'languages':
                return [
                    'typeClass' => 'Solspace\Freeform\Fields\Properties\Options\Predefined\Types\Languages\Languages',
                    'properties' => [
                        'value' => $configuration->valueType ?? 'abbreviated',
                        'label' => $configuration->listType ?? 'full',
                        'useNativeName' => false,
                    ],
                ];

            case 'currencies':
                return [
                    'typeClass' => 'Solspace\Freeform\Fields\Properties\Options\Predefined\Types\Currencies\Currencies',
                    'properties' => [
                        'value' => $configuration->valueType ?? 'abbreviated',
                        'label' => $configuration->listType ?? 'full',
                    ],
                ];

            case 'states':
            case 'states_territories':
            default:
                return [
                    'typeClass' => 'Solspace\\Freeform\\Fields\\Properties\\Options\\Predefined\\Types\\States\\States',
                    'properties' => [
                        'value' => $configuration->valueType ?? 'abbreviated',
                        'label' => $configuration->listType ?? 'full',
                        'includeTerritories' => 'states_territories' === $target,
                    ],
                ];
        }
    }

    private function processAdminNotifications(int $formId, ?\stdClass $data): void
    {
        if (null === $data) {
            return;
        }

        $recipients = FreeformStringHelper::extractSeparatedValues($data->recipients ?? '', ',');
        if (empty($recipients)) {
            return;
        }

        $notificationId = $data->notificationId ?? null;
        if (!$notificationId) {
            return;
        }

        $notification = new FormNotificationRecord();
        $notification->formId = $formId;
        $notification->class = 'Solspace\Freeform\Notifications\Types\Admin\Admin';
        $notification->enabled = true;
        $notification->dateCreated = new \DateTime();
        $notification->dateUpdated = new \DateTime();
        $notification->uid = StringHelper::UUID();
        $notification->metadata = [
            'name' => 'Admin notification',
            'enabled' => true,
            'template' => $notificationId,
            'recipients' => array_map(
                fn ($recipient) => [
                    'name' => '',
                    'email' => $recipient,
                ],
                $recipients,
            ),
        ];
        $notification->save();
    }

    private function processDynamicNotifications(FormFieldRecord $record, \stdClass $props): void
    {
        if ('dynamic_recipients' !== $props->type) {
            return;
        }

        $notificationId = $props->notificationId ?: null;
        if (!$notificationId) {
            return;
        }

        $notification = new FormNotificationRecord();
        $notification->formId = $record->formId;
        $notification->class = 'Solspace\Freeform\Notifications\Types\Dynamic\Dynamic';
        $notification->enabled = true;
        $notification->dateCreated = new \DateTime();
        $notification->dateUpdated = new \DateTime();
        $notification->uid = StringHelper::UUID();
        $notification->metadata = [
            'name' => $record->metadata['label'] ?? 'Dynamic Notification',
            'enabled' => true,
            'field' => $record->uid,
            'template' => $notificationId,
            'recipientMapping' => array_map(
                fn ($option) => [
                    'value' => $option->label,
                    'template' => '',
                    'recipients' => [['name' => '', 'email' => $option->value]],
                ],
                $props->options,
            ),
        ];

        $notification->save();
    }

    private function processEmailNotifications(FormFieldRecord $record, \stdClass $props): void
    {
        if ('email' !== $props->type) {
            return;
        }

        $notificationId = $props->notificationId ?? null;
        if (!$notificationId) {
            return;
        }

        $notification = new FormNotificationRecord();
        $notification->formId = $record->formId;
        $notification->class = 'Solspace\Freeform\Notifications\Types\EmailField\EmailField';
        $notification->enabled = true;
        $notification->dateCreated = new \DateTime();
        $notification->dateUpdated = new \DateTime();
        $notification->uid = StringHelper::UUID();
        $notification->metadata = [
            'name' => $record->metadata['label'] ?? 'Email Notification',
            'enabled' => true,
            'field' => $record->uid,
            'template' => $notificationId,
        ];

        $notification->save();
    }

    private function processRules(int $formId, \stdClass $props): void
    {
        $rules = $props->rules ?? null;
        if (!$rules || empty($rules->list)) {
            return;
        }

        foreach ($rules->list as $data) {
            $ruleRecord = null;

            foreach ($data->fieldRules as $fieldRule) {
                $targetFieldRecord = $this->fieldMap[$fieldRule->hash] ?? null;
                if (!$targetFieldRecord) {
                    continue;
                }

                $ruleRecord = new RuleRecord([
                    'uid' => StringHelper::UUID(),
                    'combinator' => $fieldRule->matchAll ? Rule::COMBINATOR_AND : Rule::COMBINATOR_OR,
                ]);
                $ruleRecord->save();

                $fieldRuleRecord = new FieldRuleRecord([
                    'id' => $ruleRecord->id,
                    'fieldId' => $targetFieldRecord->id,
                    'display' => $fieldRule->show ? 'show' : 'hide',
                ]);
                $fieldRuleRecord->save();

                $this->processCriteria($ruleRecord->id, $fieldRule->criteria);
            }

            foreach ($data->gotoRules as $pageRule) {
                $targetPageRecord = $this->pageMap[$pageRule->targetPageHash] ?? null;
                if (!$targetPageRecord) {
                    continue;
                }

                $ruleRecord = new RuleRecord([
                    'uid' => StringHelper::UUID(),
                    'combinator' => $pageRule->matchAll ? Rule::COMBINATOR_AND : Rule::COMBINATOR_OR,
                ]);
                $ruleRecord->save();

                $pageRuleRecord = new PageRuleRecord([
                    'id' => $ruleRecord->id,
                    'pageId' => $targetPageRecord->id,
                ]);
                $pageRuleRecord->save();

                $this->processCriteria($ruleRecord->id, $pageRule->criteria);
            }
        }
    }

    private function processCriteria(int $ruleId, array $criteriaList): void
    {
        foreach ($criteriaList as $criteria) {
            $conditionField = $this->fieldMap[$criteria->hash] ?? null;
            if (!$conditionField) {
                continue;
            }

            $conditionRecord = new RuleConditionRecord([
                'ruleId' => $ruleId,
                'fieldId' => $conditionField->id,
                'operator' => $criteria->equals ? Condition::TYPE_EQUALS : Condition::TYPE_NOT_EQUALS,
                'value' => $criteria->value,
            ]);
            $conditionRecord->save();
        }
    }

    private function renameOldFieldColumns(): void
    {
        $schema = $this->db->getSchema();
        $tables = $schema->getTableSchemas();

        foreach ($tables as $table) {
            if (!preg_match('/^freeform_submissions_.*_\d+$/', $table->name)) {
                continue;
            }

            $columns = $table->getColumnNames();
            foreach ($columns as $column) {
                if (!preg_match('/_\d+$/', $column)) {
                    continue;
                }

                $this->renameColumn($table->name, $column, $column.'_old');
            }
        }

        $schema->getTableSchemas('', true);
    }

    private function renameDatabaseColumn(int $formId, FormFieldRecord $record, \stdClass $props): void
    {
        $reflection = new \ReflectionClass($record->type);
        if ($reflection->implementsInterface(NoStorageInterface::class)) {
            return;
        }

        $schema = $this->db->getSchema();
        $tables = $schema->getTableSchemas();

        $table = null;
        foreach ($tables as $databaseTable) {
            if (preg_match('/^freeform_submissions_.*_'.$formId.'$/', $databaseTable->name)) {
                $table = $databaseTable;

                break;
            }
        }

        if (!$table) {
            return;
        }

        $columns = $table->getColumnNames();
        $oldColumnName = null;
        if (isset($props->id)) {
            foreach ($columns as $column) {
                if (preg_match('/.*_'.$props->id.'_old$/', $column)) {
                    $oldColumnName = $column;

                    break;
                }
            }
        }

        $metadata = json_decode($record->metadata, true);
        $handle = $metadata['handle'];
        $handle = StringHelper::toKebabCase($handle, '_');
        $handle = StringHelper::truncate($handle, 50, '');
        $handle = trim($handle, '-_');

        $newColumnName = $handle.'_'.$record->id;

        $tableName = '{{%'.$table->name.'}}';

        if ($oldColumnName) {
            $this->renameColumn($tableName, $oldColumnName, $newColumnName);
            $this->alterColumn($tableName, $newColumnName, 'text');
        } else {
            $this->addColumn($tableName, $newColumnName, $this->text());
        }
    }

    private function processPageButtonData(array $rows, \stdClass $composer): array
    {
        $metadata = [
            'layout' => 'save back|submit',

            'submitLabel' => 'Submit',

            'back' => true,
            'backLabel' => 'Back',

            'save' => false,
            'saveLabel' => 'Save',
            'saveRedirectUrl' => '',
            'emailField' => null,
            'notificationTemplate' => null,

            'attributes' => [
                'back' => new \stdClass(),
                'save' => new \stdClass(),
                'column' => new \stdClass(),
                'submit' => new \stdClass(),
                'container' => new \stdClass(),
            ],
        ];

        foreach ($rows as $row) {
            foreach ($row->columns as $hash) {
                $props = $composer->{$hash};

                switch ($props->type) {
                    case 'submit':
                        $metadata['submit'] = $props->labelNext;
                        $metadata['back'] = !$props->disablePrev;
                        $metadata['backLabel'] = $props->labelPrev;

                        $metadata['layout'] = match ($props->position) {
                            'center' => ' save|back|submit ',
                            'left' => 'back|submit|save ',
                            'right' => ' save|back|submit',
                            'spread' => 'back|save submit',
                        };

                        $attributes = $props->inputAttributes ?? null;
                        if ($attributes) {
                            $metadata['attributes']['submit'] = $this->parseAttributes($attributes);
                        }

                        break;

                    case 'save':
                        $metadata['save'] = true;
                        $metadata['saveLabel'] = $props->label;

                        if (isset($props->emailFieldHash)) {
                            $metadata['emailField'] = $this->fieldMap[$props->emailFieldHash]?->uid ?? null;
                        }

                        if (isset($props->notificationId)) {
                            $metadata['notificationTemplate'] = $props->notificationId;
                        }

                        if (isset($props->url)) {
                            $metadata['saveRedirectUrl'] = $props->url;
                        }

                        $attributes = $props->inputAttributes ?? null;
                        if ($attributes) {
                            $metadata['attributes']['back'] = $this->parseAttributes($attributes);
                        }

                        break;
                }
            }
        }

        return $metadata;
    }

    private function parseAttributes(array $attributes = []): array
    {
        $parsed = [];
        foreach ($attributes as $attribute) {
            $attr = $attribute->attribute ?? $attribute->value ?? '';
            $value = $attribute->value ?? '';

            $parsed[$attr] = $value;
        }

        return $parsed;
    }
}
