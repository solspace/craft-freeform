<?php

namespace Solspace\Freeform\Bundles\Fields\Validation;

use Solspace\Freeform\Events\Fields\ValidateEvent;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Implementations\Pro\TableField;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Helpers\ArrayHelper;
use yii\base\Event;

class TableValidation extends FeatureBundle
{
    public function __construct()
    {
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
        $isSomeFilled = ArrayHelper::someRecursive($value, static fn ($item) => !empty($item));
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
        $requiredColumnIndexes = [];
        foreach ($layout as $index => $column) {
            if ($column->required) {
                $requiredColumnIndexes[] = $index;
            }
        }

        if (0 === \count($requiredColumnIndexes)) {
            return;
        }

        $message = Freeform::t($field->getRequiredErrorMessage() ?: 'This field is required');

        $value = $field->getValue();
        $isSomeFilled = ArrayHelper::someRecursive($value, static fn ($item) => !empty($item));

        if (!$isSomeFilled) {
            $field->addError($message);

            return;
        }

        foreach ($value as $row) {
            foreach ($requiredColumnIndexes as $columnIndex) {
                if (empty($row[$columnIndex])) {
                    $field->addError($message);

                    return;
                }
            }
        }
    }

    private function allRowsFilled(TableField $field, array $rows): bool
    {
        return ArrayHelper::every($rows, function (array $row) {
            return ArrayHelper::someRecursive($row, fn ($item) => '' !== $item && null !== $item);
        });
    }
}
