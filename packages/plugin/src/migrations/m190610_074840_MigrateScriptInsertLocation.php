<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;
use Solspace\Freeform\Models\Settings;

/**
 * m190610_074840_MigrateScriptInsertLocation migration.
 */
class m190610_074840_MigrateScriptInsertLocation extends Migration
{
    public function safeUp(): bool
    {
        if (!\Craft::$app->getConfig()->getGeneral()->allowAdminChanges) {
            return true;
        }

        $pluginService = \Craft::$app->getPlugins();

        $plugin = $pluginService->getPlugin('freeform');

        if (!$plugin) {
            return true;
        }

        /** @var Settings $settings */
        $settings = $plugin->getSettings();

        try {
            $scriptInsertLocation = 'form';
            if ($settings->footerScripts) {
                $scriptInsertLocation = 'footer';
            }

            $settings->scriptInsertLocation = $scriptInsertLocation;

            $pluginService->savePluginSettings($plugin, []);
        } catch (\Exception $e) {
        }

        return true;
    }

    public function safeDown(): bool
    {
        echo "m190610_074840_MigrateScriptInsertLocation cannot be reverted.\n";

        return false;
    }
}
