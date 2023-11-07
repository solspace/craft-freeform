<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

class m231020_115409_MigrateIntegrationNamespaces extends Migration
{
    public function safeUp(): bool
    {
        $names = [
            [
                'Solspace\Freeform\Integrations\Singleton\PostForwarding\PostForwarding',
                'Solspace\Freeform\Integrations\Single\PostForwarding\PostForwarding',
            ],
            [
                'Solspace\Freeform\Integrations\Singleton\Honeypot\Honeypot',
                'Solspace\Freeform\Integrations\Single\Honeypot\Honeypot',
            ],
            [
                'Solspace\Freeform\Integrations\Singleton\GTM\GTM',
                'Solspace\Freeform\Integrations\Single\GTM\GTM',
            ],
            [
                'Solspace\Freeform\Integrations\Singleton\JavascriptTest\JavascriptTest',
                'Solspace\Freeform\Integrations\Single\JavascriptTest\JavascriptTest',
            ],
        ];

        foreach ($names as $item) {
            [$old, $new] = $item;
            $this->update(
                '{{%freeform_integrations}}',
                ['class' => $new],
                ['class' => $old]
            );
        }

        $this->update(
            '{{%freeform_integrations}}',
            ['type' => 'single'],
            ['type' => 'singleton']
        );

        return true;
    }

    public function safeDown(): bool
    {
        $names = [
            [
                'Solspace\Freeform\Integrations\Singleton\PostForwarding\PostForwarding',
                'Solspace\Freeform\Integrations\Single\PostForwarding\PostForwarding',
            ],
            [
                'Solspace\Freeform\Integrations\Singleton\Honeypot\Honeypot',
                'Solspace\Freeform\Integrations\Single\Honeypot\Honeypot',
            ],
            [
                'Solspace\Freeform\Integrations\Singleton\GTM\GTM',
                'Solspace\Freeform\Integrations\Single\GTM\GTM',
            ],
            [
                'Solspace\Freeform\Integrations\Singleton\JavascriptTest\JavascriptTest',
                'Solspace\Freeform\Integrations\Single\JavascriptTest\JavascriptTest',
            ],
        ];

        foreach ($names as $item) {
            [$old, $new] = $item;
            $this->update(
                '{{%freeform_integrations}}',
                ['class' => $new],
                ['class' => $old]
            );
        }

        $this->update(
            '{{%freeform_integrations}}',
            ['type' => 'singleton'],
            ['type' => 'single']
        );

        return true;
    }
}
