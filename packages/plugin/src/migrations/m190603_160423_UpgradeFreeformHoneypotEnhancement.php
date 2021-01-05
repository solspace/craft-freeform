<?php

namespace Solspace\Freeform\migrations;

use Craft;
use craft\db\Migration;
use Solspace\Freeform\Models\Settings;

/**
 * m190603_160423_UpgradeFreeformHoneypotEnhancement migration.
 */
class m190603_160423_UpgradeFreeformHoneypotEnhancement extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        if (!\Craft::$app->getConfig()->getGeneral()->allowAdminChanges) {
            return true;
        }

        $pluginService = Craft::$app->getPlugins();

        $plugin = $pluginService->getPlugin('freeform');

        if (!$plugin) {
            return true;
        }

        /** @var Settings $settings */
        $settings = $plugin->getSettings();

        try {
            $settings->freeformHoneypotEnhancement = true;
            $pluginService->savePluginSettings($plugin, ['freeformHoneypotEnhancement' => true]);
        } catch (\Exception $e) {
        }

        return true;
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        echo "m190603_160423_UpgradeFreeformHoneypotEnhancement cannot be reverted.\n";

        return false;
    }
}
