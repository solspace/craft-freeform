<?php

namespace Solspace\Freeform\Library\Export;

class ExportJson extends AbstractExport
{
    public function getMimeType(): string
    {
        return 'application/octet-stream';
    }

    public function getFileExtension(): string
    {
        return 'json';
    }

    public function export(): string
    {
        $output = [];
        foreach ($this->getRows() as $row) {
            $rowData = [];
            foreach ($row as $column) {
                $rowData[$column->getHandle()] = $column->getValue();
            }

            $output[] = $rowData;
        }

        return \GuzzleHttp\json_encode($output, \JSON_PRETTY_PRINT);
    }
}
