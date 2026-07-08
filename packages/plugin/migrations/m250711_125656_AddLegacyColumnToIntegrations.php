<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

class m250711_125656_AddLegacyColumnToIntegrations extends Migration
{
    public function safeUp(): bool
    {
        try {
            $this->addColumn(
                '{{%freeform_integrations}}',
                'legacy',
                $this->boolean()->defaultValue(false)->after('enabled')
            );

            $this->addColumn(
                '{{%freeform_integrations}}',
                'connectionEstablished',
                $this->boolean()->defaultValue(false)->after('legacy')
            );

            // Set legacy to true for all existing integrations
            $this->update(
                '{{%freeform_integrations}}',
                [
                    'legacy' => true,
                    'connectionEstablished' => true,
                ]
            );
        } catch (\Exception) {
        }

        return true;
    }

    public function safeDown(): bool
    {
        try {
            $this->dropColumn('{{%freeform_integrations}}', 'legacy');
            $this->dropColumn('{{%freeform_integrations}}', 'connectionEstablished');
        } catch (\Exception) {
        }

        return true;
    }
}
