<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

/**
 * m230223_143621_RemoveIntegrationsQueueMailingListFieldIndex migration.
 */
class m230223_143621_RemoveIntegrationsQueueMailingListFieldIndex extends Migration
{
    public function safeUp(): bool
    {
        // Place migration code here...

        return true;
    }

    public function safeDown(): bool
    {
        echo "m230223_143621_RemoveIntegrationsQueueMailingListFieldIndex cannot be reverted.\n";

        return false;
    }
}
