<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

/**
 * m240116_175149_RenameIntegrationTableColumns migration.
 */
class m230224_141037_RenameIntegrationTableColumns extends Migration
{
    public function safeUp(): bool
    {
        $this->renameColumn('{{%freeform_integrations}}', 'settings', 'metadata');
        $this->alterColumn('{{%freeform_integrations}}', 'metadata', $this->json());

        return true;
    }

    public function safeDown(): bool
    {
        echo "m240116_175149_RenameIntegrationTableColumns cannot be reverted.\n";

        return false;
    }
}
