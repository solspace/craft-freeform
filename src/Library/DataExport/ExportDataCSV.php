<?php
/**
 * Freeform for Craft
 *
 * @package       Solspace:Freeform
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2016, Solspace, Inc.
 * @link          https://solspace.com/craft/freeform
 * @license       https://solspace.com/software/license-agreement
 */

namespace Solspace\Freeform\Library\DataExport;

/**
 * ExportDataCSV - Exports to CSV (comma separated value) format.
 */
class ExportDataCSV extends ExportData
{
    /**
     * @param array $row
     *
     * @return string
     */
    public function generateRow($row)
    {
        foreach ($row as $key => $value) {
            // Escape inner quotes by double-quoting and wrap non-empty contents in new quotes
            if ($value != '') {
                $row[$key] = '"' . str_replace('"', '""', $value) . '"';
            }
        }

        return implode(',', $row) . "\n";
    }

    public function sendHttpHeaders()
    {
        header('Content-type: text/csv');
        header('Content-Disposition: attachment; filename="' . basename($this->filename) . '"');
    }
}
