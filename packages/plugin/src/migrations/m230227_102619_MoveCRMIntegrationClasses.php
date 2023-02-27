<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

/**
 * m230227_102619_MoveCRMIntegrationClasses migration.
 */
class m230227_102619_MoveCRMIntegrationClasses extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp(): bool
    {
        $map = $this->getMap();

        foreach ($map as $old => $new) {
            $this->update(
                '{{%freeform_integrations}}',
                ['class' => $new],
                ['class' => $old]
            );
        }

        return true;
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown(): bool
    {
        $map = $this->getMap();

        foreach ($map as $old => $new) {
            $this->update(
                '{{%freeform_integrations}}',
                ['class' => $old],
                ['class' => $new]
            );
        }

        return true;
    }

    private function getMap(): array
    {
        $pref = 'Solspace\\Freeform\\Integrations\\CRM\\';

        return [
            "{$pref}ActiveCampaign" => $pref.'ActiveCampaign\\ActiveCampaign',
            "{$pref}Freshdesk" => $pref.'Freshdesk\\Freshdesk',
            "{$pref}HubSpot" => $pref.'HubSpot\\HubSpot',
            "{$pref}Infusionsoft" => $pref.'Infusionsoft\\Infusionsoft',
            "{$pref}Insightly" => $pref.'ActiveCampaign\\Insightly',
            "{$pref}PardotV5" => $pref.'Pardot\\PardotV5',
            "{$pref}PipedriveDeals" => $pref.'Pipedrive\\PipedriveDeals',
            "{$pref}PipedriveLeads" => $pref.'Pipedrive\\PipedriveLeads',
            "{$pref}SalesforceLeads" => $pref.'Salesforce\\SalesforceLeads',
            "{$pref}SalesforceOpportunity" => $pref.'Salesforce\\SalesforceOpportunity',
            "{$pref}SharpSpring" => $pref.'SharpSpring\\SharpSpring',
            "{$pref}ZohoDeal" => $pref.'Zoho\\ZohoDeal',
            "{$pref}ZohoLead" => $pref.'Zoho\\ZohoLead',
        ];
    }
}
