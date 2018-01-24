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
 * ExportDataTSV - Exports to TSV (tab separated value) format.
 */
class ExportDataTSV extends ExportData {

    function generateRow($row) {
        foreach ($row as $key => $value) {
            // Escape inner quotes and wrap all contents in new quotes.
            // Note that we are using \" to escape double quote not ""
            $row[$key] = '"'. str_replace('"', '\"', $value) .'"';
        }
        return implode("\t", $row) . "\n";
    }

    function sendHttpHeaders() {
        header("Content-type: text/tab-separated-values");
        header("Content-Disposition: attachment; filename=".basename($this->filename));
    }
}
