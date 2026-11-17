<?php

namespace Solspace\Freeform\migrations;

use craft\helpers\FileHelper;
use Solspace\Freeform\Library\Migrations\Craft6SchemaMigration;
use Solspace\Freeform\Models\Settings;

class m261116_170000_RemoveRetiredSettings extends Craft6SchemaMigration
{
    public function safeUp(): bool
    {
        $projectConfig = \Craft::$app->projectConfig;
        // Deployed YAML is applied after migrations. Runtime normalization also
        // handles incoming YAML and PHP overrides without modifying read-only config.
        $incomingSchema = $projectConfig->get('plugins.freeform.schemaVersion', true);
        if (!$projectConfig->readOnly && (null === $incomingSchema || version_compare($incomingSchema, '6.0.0', '<'))) {
            $path = 'plugins.freeform.settings';
            $stored = $projectConfig->get($path);
            if (\is_array($stored)) {
                $settings = Settings::normalizeLegacySettings($stored, preserveExportFormatting: true);
                if ($settings !== $stored) {
                    $projectConfig->set($path, $settings, 'Remove retired Freeform settings.');
                }
            }
        }

        // Only Freeform's retired diagnostic files; leave Craft and other logs alone.
        $logPath = \Craft::$app->path->getLogPath();
        foreach (['freeform.log', 'freeform-email.log', 'freeform-integrations.log'] as $file) {
            $path = $logPath.'/'.$file;
            if (is_file($path) || is_link($path)) {
                FileHelper::unlink($path);
            }
        }

        return true;
    }

    public function safeDown(): bool
    {
        return false;
    }
}
