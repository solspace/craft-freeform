<?php

namespace Solspace\Freeform\migrations;

use Solspace\Freeform\Library\Configuration\PayloadContextUpgrade;
use Solspace\Freeform\Library\Migrations\Craft6SchemaMigration;

class m261116_192000_UseEncryptedPayloadContext extends Craft6SchemaMigration
{
    public function safeUp(): bool
    {
        $config = \Craft::$app->projectConfig;
        $schema = $config->get('plugins.freeform.schemaVersion', true);
        if (!$config->readOnly && (null === $schema || version_compare($schema, '6.0.6', '<'))) {
            $stored = $config->get('plugins.freeform.settings');
            if (\is_array($stored)) {
                $updated = PayloadContextUpgrade::settings($stored);
                if ($updated !== $stored) {
                    $config->set('plugins.freeform.settings', $updated, 'Use encrypted payloads for form state.');
                }
            }
        }
        if ($this->db->tableExists('{{%freeform_session_context}}')) {
            $this->dropTable('{{%freeform_session_context}}');
        }

        return true;
    }

    public function safeDown(): bool
    {
        return false;
    }
}
