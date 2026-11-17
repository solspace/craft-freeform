<?php

namespace Solspace\Freeform\migrations;

use Solspace\Freeform\Library\Configuration\QueueProcessingUpgrade;
use Solspace\Freeform\Library\Migrations\Craft6SchemaMigration;

class m261116_190000_CombineQueueProcessing extends Craft6SchemaMigration
{
    public function safeUp(): bool
    {
        $config = \Craft::$app->projectConfig;
        $schema = $config->get('plugins.freeform.schemaVersion', true);
        if (!$config->readOnly && (null === $schema || version_compare($schema, '6.0.4', '<'))) {
            $stored = $config->get('plugins.freeform.settings');
            if (\is_array($stored)) {
                $updated = QueueProcessingUpgrade::settings($stored);
                if ($updated !== $stored) {
                    $config->set('plugins.freeform.settings', $updated, 'Combine background submission processing settings.');
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
