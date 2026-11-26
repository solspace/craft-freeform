<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

/**
 * m240405_151009_MigrateEntryIntegrations migration.
 */
class m240405_151009_MigrateEntryIntegrations extends Migration
{
    public function safeUp(): bool
    {
        // Retained so older installation histories can still mark this migration as applied.
        return true;
    }

    public function safeDown(): bool
    {
        echo "m240405_151009_MigrateEntryIntegrations cannot be reverted.\n";

        return false;
    }
}
