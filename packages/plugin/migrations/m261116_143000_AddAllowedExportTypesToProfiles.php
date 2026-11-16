<?php

namespace Solspace\Freeform\migrations;

use Solspace\Freeform\Library\Migrations\Craft6SchemaMigration;
use Solspace\Freeform\Records\Pro\ExportProfileRecord;

class m261116_143000_AddAllowedExportTypesToProfiles extends Craft6SchemaMigration
{
    public function safeUp(): bool
    {
        if (!$this->db->columnExists(ExportProfileRecord::TABLE, 'allowedExportTypes')) {
            // Null means all registered formats are allowed, preserving existing profiles.
            $this->addColumn(ExportProfileRecord::TABLE, 'allowedExportTypes', $this->json()->null()->after('statuses'));
        }

        return true;
    }

    public function safeDown(): bool
    {
        if ($this->db->columnExists(ExportProfileRecord::TABLE, 'allowedExportTypes')) {
            $this->dropColumn(ExportProfileRecord::TABLE, 'allowedExportTypes');
        }

        return true;
    }
}
