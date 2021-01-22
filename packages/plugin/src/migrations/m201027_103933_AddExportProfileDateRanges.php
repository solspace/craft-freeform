<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

/**
 * m201027_103933_AddExportProfileDateRanges migration.
 */
class m201027_103933_AddExportProfileDateRanges extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        try {
            if (!$this->db->columnExists('{{%freeform_export_profiles}}', 'rangeStart')) {
                $this->addColumn('{{%freeform_export_profiles}}', 'rangeStart', $this->string(255)->null());
                $this->addColumn('{{%freeform_export_profiles}}', 'rangeEnd', $this->string(255)->null());
            }
        } catch (\Exception $e) {
        }

        return true;
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        try {
            if (!$this->db->columnExists('{{%freeform_export_profiles}}', 'rangeStart')) {
                $this->dropColumn('{{%freeform_export_profiles}}', 'rangeStart');
                $this->dropColumn('{{%freeform_export_profiles}}', 'rangeEnd');
            }
        } catch (\Exception $e) {
        }

        return true;
    }
}
