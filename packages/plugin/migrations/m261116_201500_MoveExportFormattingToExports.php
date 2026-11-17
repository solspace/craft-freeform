<?php

namespace Solspace\Freeform\migrations;

use Solspace\Freeform\Library\Configuration\ExportFormatting;
use Solspace\Freeform\Library\Configuration\ExportFormattingUpgrade;
use Solspace\Freeform\Library\Migrations\Craft6SchemaMigration;
use Solspace\Freeform\Records\Pro\ExportProfileRecord;
use Solspace\Freeform\Records\Pro\ExportSettingRecord;

class m261116_201500_MoveExportFormattingToExports extends Craft6SchemaMigration
{
    public function safeUp(): bool
    {
        $config = \Craft::$app->projectConfig;
        // Loaded database config retains the old values even when a deployment's
        // incoming YAML has already removed the retired settings.
        $stored = $config->get('plugins.freeform.settings') ?? [];
        $overrides = \Craft::$app->config->getConfigFromFile('freeform');
        $legacy = array_replace($stored, \is_array($overrides) ? $overrides : []);

        foreach ([ExportProfileRecord::TABLE, ExportSettingRecord::TABLE] as $table) {
            if ($this->db->tableExists($table) && !$this->db->columnExists($table, 'formatting')) {
                $this->addColumn($table, 'formatting', $this->json()->null());
            }
        }
        ExportFormattingUpgrade::seed($this->db, $legacy);

        if (!$config->readOnly) {
            $updated = ExportFormatting::removeLegacySettings($stored);
            if ($updated !== $stored) {
                $config->set('plugins.freeform.settings', $updated, 'Move export formatting preferences to exports.');
            }
        }

        return true;
    }

    public function safeDown(): bool
    {
        return false;
    }
}
