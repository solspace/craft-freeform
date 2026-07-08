<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;
use Solspace\Freeform\Models\Settings;
use Solspace\Freeform\Records\IntegrationRecord;

class m240619_111214_GenerateSpamBlockIntegrations extends Migration
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

        if ($settings->blockedEmails) {
            $record = new IntegrationRecord();
            $record->class = 'Solspace\Freeform\Integrations\SpamBlocking\Emails\BlockEmailAddresses';
            $record->type = 'spam-blocking';
            $record->name = 'Block Email Addresses';
            $record->handle = 'block-email-addresses';
            $record->enabled = true;
            $record->metadata = json_encode([
                'enabledByDefault' => true,
                'errorsBelowFields' => $settings->showErrorsForBlockedEmails,
                'errorMessage' => $settings->blockedEmailsError,
                'defaultEmails' => $settings->blockedEmails,
            ]);
            $record->save();
        }

        if ($settings->blockedKeywords) {
            $record = new IntegrationRecord();
            $record->class = 'Solspace\Freeform\Integrations\SpamBlocking\Keywords\BlockKeywords';
            $record->type = 'spam-blocking';
            $record->name = 'Block Keywords';
            $record->handle = 'block-keywords';
            $record->enabled = true;
            $record->metadata = json_encode([
                'enabledByDefault' => true,
                'errorsBelowFields' => $settings->showErrorsForBlockedKeywords,
                'errorMessage' => $settings->blockedKeywordsError,
                'defaultKeywords' => $settings->blockedKeywords,
            ]);
            $record->save();
        }

        if ($settings->blockedIpAddresses) {
            $record = new IntegrationRecord();
            $record->class = 'Solspace\Freeform\Integrations\SpamBlocking\IpAddresses\BlockIpAddresses';
            $record->type = 'spam-blocking';
            $record->name = 'Block IP Addresses';
            $record->handle = 'block-ip-addresses';
            $record->enabled = true;
            $record->metadata = json_encode([
                'enabledByDefault' => true,
                'defaultIps' => $settings->blockedIpAddresses,
            ]);
            $record->save();
        }

        return true;
    }

    public function safeDown(): bool
    {
        echo "m240619_111214_GenerateSpamBlockIntegrations cannot be reverted.\n";

        return false;
    }
}
