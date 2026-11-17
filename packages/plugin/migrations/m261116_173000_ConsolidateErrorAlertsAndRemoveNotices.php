<?php

namespace Solspace\Freeform\migrations;

use Solspace\Freeform\Library\Migrations\Craft6SchemaMigration;
use Solspace\Freeform\Models\Settings;

class m261116_173000_ConsolidateErrorAlertsAndRemoveNotices extends Craft6SchemaMigration
{
    public function safeUp(): bool
    {
        $projectConfig = \Craft::$app->projectConfig;
        $incomingSchema = $projectConfig->get('plugins.freeform.schemaVersion', true);
        // Incoming YAML and read-only environments use the same normalization
        // when the settings model loads, without changing deployed config.
        if (!$projectConfig->readOnly && (null === $incomingSchema || version_compare($incomingSchema, '6.0.1', '<'))) {
            $path = 'plugins.freeform.settings';
            $stored = $projectConfig->get($path);
            if (\is_array($stored)) {
                $settings = Settings::normalizeLegacySettings($stored, preserveExportFormatting: true);
                if ($settings !== $stored) {
                    $projectConfig->set($path, $settings, 'Consolidate error alert recipients and remove control panel notices.');
                }
            }
        }

        foreach (['{{%freeform_feed_messages}}', '{{%freeform_feeds}}'] as $table) {
            if ($this->db->tableExists($table)) {
                $this->dropTable($table);
            }
        }

        return true;
    }

    public function safeDown(): bool
    {
        return false;
    }
}
