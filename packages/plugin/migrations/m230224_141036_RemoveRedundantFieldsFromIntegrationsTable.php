<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

class m230224_141036_RemoveRedundantFieldsFromIntegrationsTable extends Migration
{
    public function safeUp(): bool
    {
        $this->dropColumn('{{%freeform_integrations}}', 'accessToken');
        $this->dropColumn('{{%freeform_integrations}}', 'forceUpdate');

        return true;
    }

    public function safeDown(): bool
    {
        echo "m230224_141036_RemoveRedundantFieldsFromIntegrationsTable cannot be reverted.\n";

        return false;
    }
}
