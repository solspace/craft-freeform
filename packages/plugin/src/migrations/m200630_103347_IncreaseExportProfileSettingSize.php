<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

/**
 * m200630_103347_IncreaseExportProfileSettingSize migration.
 */
class m200630_103347_IncreaseExportProfileSettingSize extends Migration
{
    public function safeUp()
    {
        try {
            $this->alterColumn(
                '{{%freeform_export_settings}}',
                'setting',
                $this->mediumText()
            );
        } catch (\Exception $e) {
        }

        return true;
    }

    public function safeDown()
    {
        try {
            $this->alterColumn(
                '{{%freeform_export_settings}}',
                'setting',
                $this->text()
            );
        } catch (\Exception $e) {
        }

        return true;
    }
}
