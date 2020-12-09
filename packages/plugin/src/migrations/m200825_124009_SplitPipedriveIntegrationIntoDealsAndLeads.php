<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

/**
 * m200825_124009_SplitPipedriveIntegrationIntoDealsAndLeads migration.
 */
class m200825_124009_SplitPipedriveIntegrationIntoDealsAndLeads extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->update(
            '{{%freeform_integrations}}',
            ['class' => 'Solspace\Freeform\Integrations\CRM\PipedriveDeals'],
            ['class' => 'Solspace\Freeform\Integrations\CRM\Pipedrive']
        );

        return true;
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->update(
            '{{%freeform_integrations}}',
            ['class' => 'Solspace\Freeform\Integrations\CRM\Pipedrive'],
            ['class' => 'Solspace\Freeform\Integrations\CRM\PipedriveDeals']
        );

        return true;
    }
}
