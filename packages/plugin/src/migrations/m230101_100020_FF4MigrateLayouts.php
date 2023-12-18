<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;
use craft\db\Query;
use craft\helpers\StringHelper;
use Solspace\Freeform\Records\Form\FormFieldRecord;
use Solspace\Freeform\Records\Form\FormLayoutRecord;
use Solspace\Freeform\Records\Form\FormPageRecord;
use Solspace\Freeform\Records\Form\FormRowRecord;
use Solspace\Freeform\Records\FormRecord;

class m230101_100020_FF4MigrateLayouts extends Migration
{
    private const IGNORED_FIELD_TYPES = [
        'cc_details',
        'cc_number',
        'cc_expiry',
        'cc_cvc',
        'mailing_list',
        'recaptcha',
    ];

    public function safeUp(): bool
    {
        $this->addLayoutTables();
        $this->migrateLayoutData();

        return true;
    }

    public function safeDown(): bool
    {
        echo "m230101_100020_FF4MigrateLayouts cannot be reverted.\n";

        return false;
    }

    private function addLayoutTables(): void
    {
        $this->createTable(
            '{{%freeform_forms_layouts}}',
            [
                'id' => $this->primaryKey(),
                'formId' => $this->integer()->notNull(),
                'dateCreated' => $this->dateTime()->notNull(),
                'dateUpdated' => $this->dateTime()->notNull(),
                'uid' => $this->uid(),
            ]
        );

        $this->createIndex(null, '{{%freeform_forms_layouts}}', ['formId']);
        $this->addForeignKey(
            null,
            '{{%freeform_forms_layouts}}',
            ['formId'],
            '{{%freeform_forms}}',
            ['id'],
            'CASCADE'
        );

        // --------------------------------------------------------------

        $this->createTable(
            '{{%freeform_forms_pages}}',
            [
                'id' => $this->primaryKey(),
                'formId' => $this->integer()->notNull(),
                'layoutId' => $this->integer()->notNull(),
                'label' => $this->string(255)->notNull(),
                'order' => $this->integer()->defaultValue(0),
                'metadata' => $this->json(),
                'dateCreated' => $this->dateTime()->notNull(),
                'dateUpdated' => $this->dateTime()->notNull(),
                'uid' => $this->uid(),
            ],
        );

        $this->createIndex(null, '{{%freeform_forms_pages}}', ['formId', 'order']);
        $this->addForeignKey(
            null,
            '{{%freeform_forms_pages}}',
            ['formId'],
            '{{%freeform_forms}}',
            ['id'],
            'CASCADE'
        );
        $this->addForeignKey(
            null,
            '{{%freeform_forms_pages}}',
            ['layoutId'],
            '{{%freeform_forms_layouts}}',
            ['id'],
            'CASCADE'
        );

        // --------------------------------------------------------------

        $this->createTable(
            '{{%freeform_forms_rows}}',
            [
                'id' => $this->primaryKey(),
                'formId' => $this->integer()->notNull(),
                'layoutId' => $this->integer()->notNull(),
                'order' => $this->integer()->defaultValue(0),
                'dateCreated' => $this->dateTime()->notNull(),
                'dateUpdated' => $this->dateTime()->notNull(),
                'uid' => $this->uid(),
            ]
        );

        $this->createIndex(null, '{{%freeform_forms_rows}}', ['formId', 'order']);
        $this->addForeignKey(
            null,
            '{{%freeform_forms_rows}}',
            ['formId'],
            '{{%freeform_forms}}',
            ['id'],
            'CASCADE'
        );
        $this->addForeignKey(
            null,
            '{{%freeform_forms_rows}}',
            ['layoutId'],
            '{{%freeform_forms_layouts}}',
            ['id'],
            'CASCADE'
        );

        // --------------------------------------------------------------

        $this->createTable(
            '{{%freeform_forms_fields}}',
            [
                'id' => $this->primaryKey(),
                'formId' => $this->integer()->notNull(),
                'type' => $this->string(255)->notNull(),
                'metadata' => $this->json(),
                'rowId' => $this->integer()->null(),
                'order' => $this->integer()->defaultValue(0),
                'dateCreated' => $this->dateTime()->notNull(),
                'dateUpdated' => $this->dateTime()->notNull(),
                'uid' => $this->uid(),
            ]
        );

        $this->createIndex(null, '{{%freeform_forms_fields}}', ['rowId', 'order']);
        $this->addForeignKey(
            null,
            '{{%freeform_forms_fields}}',
            ['formId'],
            '{{%freeform_forms}}',
            ['id'],
            'CASCADE'
        );
        $this->addForeignKey(
            null,
            '{{%freeform_forms_fields}}',
            ['rowId'],
            '{{%freeform_forms_rows}}',
            ['id'],
            'CASCADE'
        );
    }

    private function migrateLayoutData(): void
    {
        $layouts = (new Query())
            ->select('layoutJson')
            ->from(FormRecord::TABLE)
            ->indexBy('id')
            ->column()
        ;

        $fields = (new Query())
            ->select('*')
            ->from('{{%freeform_fields}}')
            ->indexBy('id')
            ->all()
        ;

        foreach ($layouts as $formId => $layoutJson) {
            $composer = json_decode($layoutJson)->composer;

            $properties = $composer->properties;
            $layoutData = $composer->layout;

            $pageOrder = 0;
            foreach ($layoutData as $pageIndex => $pageData) {
                $pageProps = $properties->{'page'.$pageIndex};

                $defaultMetadata = [
                    'buttons' => [
                        'back' => [
                            'label' => 'Back',
                            'enabled' => true,
                        ],
                        'save' => [
                            'label' => 'Save',
                            'enabled' => false,
                        ],
                        'layout' => 'save back|submit',
                        'submit' => [
                            'label' => 'Submit',
                            'enabled' => true,
                        ],
                        'attributes' => [
                            'back' => new \stdClass(),
                            'save' => new \stdClass(),
                            'column' => new \stdClass(),
                            'submit' => new \stdClass(),
                            'container' => new \stdClass(),
                        ],
                    ],
                ];

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

                        $field = new FormFieldRecord([
                            'formId' => $formId,
                            'rowId' => $row->id,
                            'order' => $fieldOrder++,
                            'type' => $this->getClass($props),
                            'metadata' => $this->extractMetadata($props),
                            'uid' => StringHelper::UUID(),
                        ]);
                        $field->save();

                        $hasFields = true;
                    }

                    if (!$hasFields) {
                        $row->delete();
                    }
                }
            }
        }
    }

    private function getClassFromType(\stdClass $data): string
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

    private function extractMetadata(\stdClass $data): array
    {
        $base = [
            'label' => $data->label ?? '',
            'handle' => $data->handle ?? '',
            'required' => (bool) $data?->required,
            'instructions' => $data->instructions ?? '',
            'defaultValue' => $data->value ?? null,
            'encrypted' => false,
            'attributes' => [
                'input' => $data->inputAttributes ?? [],
                'container' => [],
                'label' => $data->labelAttributes ?? [],
                'error' => $data->errorAttributes ?? [],
                'instructions' => $data->instructionAttributes ?? [],
            ],
        ];

        $extra = array_filter([
            // Generic
            'placeholder' => $data->placeholder ?? null,
            'minLength' => $data->minLength ?? null,
            'maxLength' => $data->maxLength ?? null,
            // Checkbox
            'checked' => $data->checked ?? null,
            // Options
            'options' => $data->options ?? null,
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
            // Phone
            'useJsMask' => $data->useScript ?? null,
            // Number
            'step' => $data->step ?? null,
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
            'select', 'checkbox_group', 'radio_group' => $this->processOptions($data),
            default => [],
        };
    }

    private function processOptions(\stdClass $data): array
    {
        $configuration = $data->configuration ?? new \stdClass();

        return match ($data->source) {
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
                        'label' => $configuration->label ?? 'title',
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
                'optionConfiguration' => [
                    'source' => 'predefined',
                    ...$this->getPredefinedOptionConfiguration($data),
                ],
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

    private function getPredefinedOptionConfiguration(\stdClass $data): array
    {
        $target = $data->target;

        switch ($target) {
            case 'numbers':
                return [
                    'typeClass' => 'Solspace\\Freeform\\Fields\\Properties\\Options\\Predefined\\Types\\Numbers\\Numbers',
                    'properties' => [
                        'step' => 1,
                        'first' => $data->start ?? 0,
                        'second' => $data->end ?? 20,
                    ],
                ];

            case 'years':
                return [
                    'typeClass' => 'Solspace\Freeform\Fields\Properties\Options\Predefined\Types\Years\Years',
                    'properties' => [
                        'first' => $data->start ?? 100,
                        'last' => $data->end ?? 0,
                    ],
                ];

            case 'months':
                $value = match ($data->valueType) {
                    'int' => 'single',
                    'int_w_zero' => 'double',
                    default => $data->valueType,
                };

                $label = match ($data->listType) {
                    'int' => 'single',
                    'int_w_zero' => 'double',
                    default => $data->listType,
                };

                return [
                    'typeClass' => 'Solspace\Freeform\Fields\Properties\Options\Predefined\Types\Months\Months',
                    'properties' => [
                        'value' => $value,
                        'label' => $label,
                    ],
                ];

            case 'days':
                $value = match ($data->valueType) {
                    'int' => 'single',
                    'int_w_zero' => 'double',
                };

                $label = match ($data->listType) {
                    'int' => 'single',
                    'int_w_zero' => 'double',
                };

                return [
                    'typeClass' => 'Solspace\Freeform\Fields\Properties\Options\Predefined\Types\Days\Days',
                    'properties' => [
                        'value' => $value,
                        'label' => $label,
                    ],
                ];

            case 'days_of_week':
                $value = match ($data->valueType) {
                    'int' => 'single',
                    default => $data->valueType,
                };

                $label = match ($data->listType) {
                    'int' => 'single',
                    default => $data->listType,
                };

                return [
                    'typeClass' => 'Solspace\Freeform\Fields\Properties\Options\Predefined\Types\DaysOfWeek\DaysOfWeek',
                    'properties' => [
                        'value' => $value,
                        'label' => $label,
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
                        'value' => $data->valueType ?? 'abbreviated',
                        'label' => $data->listType ?? 'full',
                        'language' => $language,
                    ],
                ];

            case 'countries':
                return [
                    'typeClass' => 'Solspace\Freeform\Fields\Properties\Options\Predefined\Types\Countries\Countries',
                    'properties' => [
                        'value' => $data->valueType ?? 'abbreviated',
                        'label' => $data->listType ?? 'full',
                    ],
                ];

            case 'languages':
                return [
                    'typeClass' => 'Solspace\Freeform\Fields\Properties\Options\Predefined\Types\Languages\Languages',
                    'properties' => [
                        'value' => $data->valueType ?? 'abbreviated',
                        'label' => $data->listType ?? 'full',
                        'useNativeName' => false,
                    ],
                ];

            case 'currencies':
                return [
                    'typeClass' => 'Solspace\Freeform\Fields\Properties\Options\Predefined\Types\Currencies\Currencies',
                    'properties' => [
                        'value' => $data->valueType ?? 'abbreviated',
                        'label' => $data->listType ?? 'full',
                    ],
                ];

            case 'states':
            case 'states_territories':
            default:
                return [
                    'typeClass' => 'Solspace\\Freeform\\Fields\\Properties\\Options\\Predefined\\Types\\States\\States',
                    'properties' => [
                        'value' => $data->valueType ?? 'abbreviated',
                        'label' => $data->listType ?? 'full',
                        'includeTerritories' => 'states_territories' === $target,
                    ],
                ];
        }
    }
}
