<?php

namespace Solspace\Freeform\Library\Export;

use Solspace\Commons\Helpers\StringHelper;
use Solspace\Freeform\Fields\Pro\TableField;
use Solspace\Freeform\Fields\TextareaField;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\ObscureValueInterface;

class ExportCsv extends AbstractExport
{
    /**
     * @return string
     */
    public function getMimeType(): string
    {
        return 'text/csv';
    }

    /**
     * @return string
     */
    public function getFileExtension(): string
    {
        return 'csv';
    }

    /**
     * @return string
     */
    public function export()
    {
        if (empty($this->getRows())) {
            return '';
        }

        $output = [];
        foreach ($this->getValuesAsArray() as $row) {
            $rowData = [];
            foreach ($row as $value) {
                if ($value) {
                    $rowData[] = '"' . str_replace('"', '""', $value) . '"';
                } else {
                    $rowData[] = null;
                }
            }

            $output[] = StringHelper::implodeRecursively(',', $rowData);
        }

        return StringHelper::implodeRecursively("\n", $output);
    }

    /**
     * @return array
     */
    protected function getValuesAsArray(): array
    {
        $output = [];
        foreach ($this->getRows() as $rowIndex => $row) {
            if ($rowIndex === 0) {
                $labels = [];
                foreach ($row as $column) {
                    if ($column->getField() instanceof TableField) {
                        foreach ($column->getField()->getTableLayout() as $layout) {
                            $labels[] = $layout['label'] ?? '-';
                        }
                    } else {
                        $labels[] = $column->getLabel();
                    }
                }

                $output[] = $labels;
            }

            $values = [];
            foreach ($row as $column) {
                $value = $column->getValue();
                $field = $column->getField();

                if ($field && $field instanceof TableField) {
                    $values = array_merge($values, $this->extractTableRow(0, $value, $field));
                } else {
                    if ($value) {
                        if (is_array($value) || is_object($value)) {
                            $value = StringHelper::implodeRecursively(', ', (array) $value);
                        }

                        if ($field) {
                            if ($field instanceof TextareaField && $this->isRemoveNewLines()) {
                                $value = trim(preg_replace('/\s+/', ' ', $value));
                            } else if ($field instanceof ObscureValueInterface) {
                                $value = $field->getActualValue($value);
                            }
                        }
                    }

                    $values[] = $value;
                }
            }

            $output[] = $values;

            if ($row->hasMultiDimensionalFields() && $row->getArtificialRowCount()) {
                for ($i = 1; $i <= $row->getArtificialRowCount(); $i++) {
                    $values = [];
                    foreach ($row as $column) {
                        $field = $column->getField();
                        $value = $column->getValue();
                        if ($field instanceof TableField) {
                            $values = array_merge($values, $this->extractTableRow($i, $value, $field));
                        } else {
                            $values[] = null;
                        }
                    }

                    $output[] = $values;
                }
            }
        }

        return $output;
    }

    /**
     * @param int        $rowIndex
     * @param array      $tableValues
     * @param TableField $field
     *
     * @return array
     */
    private function extractTableRow(int $rowIndex, array $tableValues, TableField $field): array
    {
        $values = [];
        foreach ($field->getTableLayout() as $index => $layout) {
            $tableColumnValue = $tableValues[$rowIndex][$index] ?? null;

            $values[] = $tableColumnValue;
        }

        return $values;
    }
}
