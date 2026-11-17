<?php

namespace Solspace\Freeform\migrations;

use Solspace\Freeform\Library\Configuration\TwigAccessUpgrade;
use Solspace\Freeform\Library\Migrations\Craft6SchemaMigration;

class m261116_191000_CombineHtmlBlockTwigAccess extends Craft6SchemaMigration
{
    public function safeUp(): bool
    {
        $config = \Craft::$app->projectConfig;
        $schema = $config->get('plugins.freeform.schemaVersion', true);
        if (!$config->readOnly && (null === $schema || version_compare($schema, '6.0.5', '<'))) {
            $stored = $config->get('plugins.freeform.settings');
            if (\is_array($stored)) {
                $updated = TwigAccessUpgrade::settings($stored);
                if ($updated !== $stored) {
                    $config->set('plugins.freeform.settings', $updated, 'Combine HTML block Twig access settings.');
                }
            }
        }

        return true;
    }

    public function safeDown(): bool
    {
        return false;
    }
}
