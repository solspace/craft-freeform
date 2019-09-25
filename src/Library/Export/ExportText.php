<?php

namespace Solspace\Freeform\Library\Export;

use Solspace\Commons\Helpers\StringHelper;

class ExportText extends AbstractExport
{
    /**
     * @return string
     */
    public function getMimeType(): string
    {
        return 'text/plain';
    }

    /**
     * @return string
     */
    public function getFileExtension(): string
    {
        return 'txt';
    }

    /**
     * @return string
     */
    public function export(): string
    {
        $output = '';
        foreach ($this->getRows() as $rowIndex => $row) {
            foreach ($row as $column) {
                $value = $column->getValue();
                if (is_array($value) || is_object($value)) {
                    $value = StringHelper::implodeRecursively(', ', (array) $value);
                }

                $output .= $column->getHandle() . ': ' . $value . "\n";
            }

            $output .= "\n";
        }

        return $output;
    }
}
