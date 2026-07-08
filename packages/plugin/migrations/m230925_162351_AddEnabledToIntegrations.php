<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

/**
 * m230925_162351_AddEnabledToIntegrations migration.
 */
class m230925_162351_AddEnabledToIntegrations extends Migration
{
    public function safeUp(): bool
    {
        $this->addColumn(
            '{{%freeform_integrations}}',
            'enabled',
            $this->boolean()->defaultValue(true)->after('id')
        );

        return true;
    }

    public function safeDown(): bool
    {
        $this->dropColumn('{{%freeform_integrations}}', 'enabled');

        return true;
    }
}
