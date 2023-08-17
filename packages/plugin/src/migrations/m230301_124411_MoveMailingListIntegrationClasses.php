<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

/**
 * m230301_124411_MoveMailingListIntegrationClasses migration.
 */
class m230301_124411_MoveMailingListIntegrationClasses extends Migration
{
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
        $pref = 'Solspace\\Freeform\\Integrations\\MailingLists\\';

        return [
            "{$pref}ActiveCampaign" => $pref.'ActiveCampaign\\ActiveCampaign',
            "{$pref}Campaign" => $pref.'Campaign\\Campaign',
            "{$pref}CampaignMonitor" => $pref.'CampaignMonitor\\CampaignMonitor',
            "{$pref}ConstantContact3" => $pref.'ConstantContact\\ConstantContact3',
            "{$pref}Dotmailer" => $pref.'Dotmailer\\Dotmailer',
            "{$pref}MailChimp" => $pref.'MailChimp\\MailChimp',
        ];
    }
}
