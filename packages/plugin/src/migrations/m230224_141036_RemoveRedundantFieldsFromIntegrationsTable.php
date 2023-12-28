<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

/**
 * m230224_141036_RemoveRedundantFieldsFromIntegrationsTable migration.
 */
class m230224_141036_RemoveRedundantFieldsFromIntegrationsTable extends Migration
{
    public function safeUp(): bool
    {
        $this->dropColumn('{{%freeform_integrations}}', 'accessToken');
        $this->dropColumn('{{%freeform_integrations}}', 'forceUpdate');
        $this->alterColumn('{{%freeform_integrations}}', 'settings', $this->json());
        $this->renameColumn('{{%freeform_integrations}}', 'settings', 'metadata');

        return true;
    }

    public function safeDown(): bool
    {
        echo "m230224_141036_RemoveRedundantFieldsFromIntegrationsTable cannot be reverted.\n";

        return false;
    }
}
