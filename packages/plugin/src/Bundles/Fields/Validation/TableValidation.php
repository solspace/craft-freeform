<?php

namespace Solspace\Freeform\Bundles\Fields\Validation;

use Solspace\Freeform\Bundles\Fields\Validation\Helpers\FileUploadValidationHelper;
use Solspace\Freeform\Events\Fields\ValidateEvent;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Implementations\FileUploadField;
use Solspace\Freeform\Fields\Implementations\Pro\TableField;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Helpers\ArrayHelper;
use yii\base\Event;

class TableValidation extends FeatureBundle
{
    private const NUMBER_PATTERN = '/^-?(?:\d+(?:\.|,)\d+|\d+|(?:\.|,)\d+)$/';

    public function __construct(
        private FileUploadValidationHelper $fileValidationHelper,
    ) {
        Event::on(
            FieldInterface::class,
            FieldInterface::EVENT_VALIDATE,
            [$this, 'validateRowLimit']
        );

        Event::on(
            FieldInterface::class,
            FieldInterface::EVENT_VALIDATE,
            [$this, 'validateRequired']
        );

        Event::on(
            FieldInterface::class,
            FieldInterface::EVENT_VALIDATE,
            [$this, 'validateRequiredColumns']
        );

        Event::on(
            FieldInterface::class,
            FieldInterface::EVENT_VALIDATE,
            [$this, 'validateFileColumns']
        );

        Event::on(
            FieldInterface::class,
            FieldInterface::EVENT_VALIDATE,
            [$this, 'validateNumberColumns']
        );
    }

    public function validateRowLimit(ValidateEvent $event): void
    {
        $field = $event->getField();
        if (!$field instanceof TableField) {
            return;
        }

        $value = $field->getValue();
        $rows = \is_array($value) ? \count($value) : 0;

        $limitRows = $field->getLimitRows();

        if (TableField::LIMIT_ROWS_EXACT === $limitRows) {
            $exactRows = $field->getExactRows();
            if (null !== $exactRows && $exactRows > 0) {
                if ($rows !== $exactRows) {
                    $field->addError(Freeform::t('This table must have exactly {exactRows} rows.', ['exactRows' => $exactRows]));

                    return;
                }
                if (!$this->allRowsFilled($field, $value)) {
                    $field->addError(Freeform::t('All {exactRows} rows must be filled out.', ['exactRows' => $exactRows]));

                    return;
                }
            }

            return;
        }

        if (TableField::LIMIT_ROWS_MINIMUM === $limitRows || TableField::LIMIT_ROWS_RANGE === $limitRows) {
            $minRows = $field->getMinRows();
            if (null !== $minRows && $minRows > 0) {
                if ($rows < $minRows) {
                    $field->addError(Freeform::t('This table must have at least {minRows} rows.', ['minRows' => $minRows]));

                    return;
                }
                $value = \is_array($value) ? $value : [];
                if (!$this->allRowsFilled($field, \array_slice($value, 0, $minRows))) {
                    $field->addError(Freeform::t('At least the first {minRows} rows must be filled out.', ['minRows' => $minRows]));

                    return;
                }
            }
        }

        if (TableField::LIMIT_ROWS_MAXIMUM === $limitRows || TableField::LIMIT_ROWS_RANGE === $limitRows || '' === $limitRows) {
            $maxRows = $field->getMaxRows();
            if (null !== $maxRows && $maxRows > 0 && $rows > $maxRows) {
                $field->addError(Freeform::t('The maximum number of rows is {maxRows}.', ['maxRows' => $maxRows]));
            }
        }
    }

    public function validateRequired(ValidateEvent $event): void
    {
        $field = $event->getField();
        if (!$field instanceof TableField) {
            return;
        }

        $isRequired = $field->isRequired();
        if (!$isRequired) {
            return;
        }

        $value = $field->getValue();
        $isSomeFilled = ArrayHelper::someRecursive($value, static fn ($item) => '' !== $item && null !== $item);
        if (!$isSomeFilled) {
            $message = $field->getRequiredErrorMessage() ?: Freeform::t('This field is required');

            $field->addError($message);
        }
    }

    public function validateRequiredColumns(ValidateEvent $event): void
    {
        $field = $event->getField();
        if (!$field instanceof TableField) {
            return;
        }

        $layout = $field->getTableLayout();
        $requiredColumns = [];
        foreach ($layout as $index => $column) {
            if ($column->required) {
                $requiredColumns[$index] = $column->type ?? TableField::COLUMN_TYPE_STRING;
            }
        }

        if (empty($requiredColumns)) {
            return;
        }

        $message = Freeform::t($field->getRequiredErrorMessage() ?: 'This field is required');

        $value = $field->getValue();
        $isSomeFilled = ArrayHelper::someRecursive($value, static fn ($item) => '' !== $item && null !== $item);

        if (!$isSomeFilled) {
            $field->addError($message);

            return;
        }

        foreach ($value as $rowIndex => $row) {
            foreach ($requiredColumns as $columnIndex => $columnType) {
                $columnValue = $row[$columnIndex] ?? null;
                if (!$this->hasRequiredColumnValue($field, (int) $rowIndex, (int) $columnIndex, $columnType, $columnValue)) {
                    $field->addError($message);

                    return;
                }
            }
        }
    }

    public function validateFileColumns(ValidateEvent $event): void
    {
        $field = $event->getField();
        if (!$field instanceof TableField) {
            return;
        }

        $layout = $field->getTableLayout();
        $fileColumns = [];
        foreach ($layout as $index => $column) {
            if (TableField::COLUMN_TYPE_FILE === ($column->type ?? null)) {
                $fileColumns[$index] = \is_array($column->metadata ?? null) ? $column->metadata : [];
            }
        }

        if (empty($fileColumns)) {
            return;
        }

        $handle = $field->getHandle();
        if (!isset($_FILES[$handle])) {
            return;
        }

        $files = $_FILES[$handle];
        $rows = $files['name'] ?? null;
        if (!\is_array($rows)) {
            return;
        }

        foreach ($rows as $rowIndex => $rowData) {
            if (!\is_array($rowData)) {
                continue;
            }

            foreach ($fileColumns as $columnIndex => $metadata) {
                $columnFiles = $this->fileValidationHelper->extractNestedFilesInput($files, (int) $rowIndex, (int) $columnIndex);
                if (empty($columnFiles)) {
                    continue;
                }

                $maxFileCount = (int) ($metadata['fileCount'] ?? FileUploadField::DEFAULT_FILE_COUNT);
                if ($maxFileCount < FileUploadField::DEFAULT_FILE_COUNT) {
                    $maxFileCount = FileUploadField::DEFAULT_FILE_COUNT;
                }

                if (\count($columnFiles) > $maxFileCount) {
                    $field->addError(
                        Freeform::t(
                            'Tried uploading {count} files. Maximum {max} files allowed.',
                            ['max' => $maxFileCount, 'count' => \count($columnFiles)]
                        )
                    );
                }

                $maxFileSizeKB = (int) ($metadata['maxFileSizeKB'] ?? FileUploadField::DEFAULT_MAX_FILESIZE_KB);
                if ($maxFileSizeKB < 1) {
                    $maxFileSizeKB = FileUploadField::DEFAULT_MAX_FILESIZE_KB;
                }

                $fileKinds = $metadata['fileKinds'] ?? ['image'];
                if (!\is_array($fileKinds)) {
                    $fileKinds = ['image'];
                }

                $validExtensions = $this->fileValidationHelper->getValidExtensionsForKinds($fileKinds);
                foreach ($columnFiles as $columnFile) {
                    $this->fileValidationHelper->validateFileEntry(
                        $columnFile,
                        $validExtensions,
                        $maxFileSizeKB,
                        static fn (string $message) => $field->addError($message),
                    );
                }
            }
        }
    }

    public function validateNumberColumns(ValidateEvent $event): void
    {
        $field = $event->getField();
        if (!$field instanceof TableField) {
            return;
        }

        $numberColumns = [];
        foreach ($field->getTableLayout() as $index => $column) {
            if (TableField::COLUMN_TYPE_NUMBER === ($column->type ?? null)) {
                $numberColumns[$index] = \is_array($column->metadata ?? null) ? $column->metadata : [];
            }
        }

        if (empty($numberColumns)) {
            return;
        }

        foreach ($field->getValue() as $row) {
            foreach ($numberColumns as $columnIndex => $metadata) {
                $value = $row[$columnIndex] ?? '';
                if ('' === $value || null === $value) {
                    continue;
                }

                if (!\is_scalar($value)) {
                    $field->addError(Freeform::t('Value must be numeric'));

                    continue;
                }

                $this->validateNumberColumnValue($field, (string) $value, $metadata);
            }
        }
    }

    private function allRowsFilled(TableField $field, array $rows): bool
    {
        return ArrayHelper::every($rows, static function (array $row) {
            return ArrayHelper::someRecursive($row, static fn ($item) => '' !== $item && null !== $item);
        });
    }

    private function hasRequiredColumnValue(
        TableField $field,
        int $rowIndex,
        int $columnIndex,
        string $columnType,
        mixed $value,
    ): bool {
        if (TableField::COLUMN_TYPE_FILE === $columnType) {
            if (\is_array($value)) {
                $value = array_values(array_filter(
                    $value,
                    static fn (mixed $item) => null !== $item && '' !== $item
                ));

                if (!empty($value)) {
                    return true;
                }
            } elseif (null !== $value && '' !== $value) {
                return true;
            }

            $files = $_FILES[$field->getHandle()] ?? null;
            if (\is_array($files)) {
                $pendingUploads = $this->fileValidationHelper->extractNestedFilesInput($files, $rowIndex, $columnIndex);

                return !empty($pendingUploads);
            }

            return false;
        }

        return '' !== $value && null !== $value;
    }

    private function validateNumberColumnValue(TableField $field, string $value, array $metadata): void
    {
        $minLength = (int) ($metadata['minLength'] ?? 0);
        if ($minLength > 0 && \strlen($value) < $minLength) {
            $field->addError(
                Freeform::t(
                    'Value must be at least {minLength} characters',
                    ['minLength' => $minLength],
                )
            );
        }

        $maxLength = (int) ($metadata['maxLength'] ?? 0);
        if ($maxLength > 0 && \strlen($value) > $maxLength) {
            $field->addError(
                Freeform::t(
                    'Value must be no more than {maxLength} characters',
                    ['maxLength' => $maxLength],
                )
            );
        }

        if (!preg_match(self::NUMBER_PATTERN, $value)) {
            $field->addError(Freeform::t('Value must be numeric'));

            return;
        }

        $decimalCount = max(0, (int) ($metadata['decimalCount'] ?? 0));
        if (preg_match('/[.,](\d+)$/', $value, $decimalMatches)) {
            $decimals = $decimalMatches[1];
            if (\strlen($decimals) > $decimalCount) {
                $field->addError(
                    str_replace(
                        '{{dec}}',
                        $decimalCount,
                        Freeform::t('{{dec}} decimal places allowed')
                    )
                );
            }
        }

        $numericValue = (float) str_replace(',', '.', $value);
        $minMaxValues = \is_array($metadata['minMaxValues'] ?? null)
            ? $metadata['minMaxValues']
            : [null, null];
        $min = $minMaxValues[0] ?? null;
        $max = $minMaxValues[1] ?? null;
        $minEnabled = null !== $min && '' !== $min;
        $maxEnabled = null !== $max && '' !== $max;

        if ($minEnabled && !$maxEnabled && $numericValue < (float) $min) {
            $field->addError(
                str_replace(
                    '{{min}}',
                    (string) $min,
                    Freeform::t('The value must be no less than {{min}}')
                )
            );
        } elseif ($maxEnabled && !$minEnabled && $numericValue > (float) $max) {
            $field->addError(
                str_replace(
                    '{{max}}',
                    (string) $max,
                    Freeform::t('The value must be no more than {{max}}')
                )
            );
        } elseif ($minEnabled && $maxEnabled && ($numericValue < (float) $min || $numericValue > (float) $max)) {
            $field->addError(
                str_replace(
                    ['{{min}}', '{{max}}'],
                    [(string) $min, (string) $max],
                    Freeform::t('The value must be between {{min}} and {{max}}')
                )
            );
        }
    }
}
