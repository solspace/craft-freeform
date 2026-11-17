<?php

namespace Solspace\Freeform\migrations;

use Solspace\Freeform\Library\Configuration\UploadRetentionUpgrade;
use Solspace\Freeform\Library\Migrations\Craft6SchemaMigration;

class m261116_193000_CombineUploadRetention extends Craft6SchemaMigration
{
    public function safeUp(): bool
    {
        $config = \Craft::$app->projectConfig;
        $schema = $config->get('plugins.freeform.schemaVersion', true);
        if (!$config->readOnly && (null === $schema || version_compare($schema, '6.0.7', '<'))) {
            $stored = $config->get('plugins.freeform.settings');
            if (\is_array($stored)) {
                $updated = UploadRetentionUpgrade::settings($stored);
                if ($updated !== $stored) {
                    $config->set('plugins.freeform.settings', $updated, 'Combine upload retention settings.');
                }
            }
        }

        return true;
    }

    public function safeDown(): bool
    {
        return false;
    }
}
