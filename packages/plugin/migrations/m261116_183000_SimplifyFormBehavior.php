<?php

namespace Solspace\Freeform\migrations;

use craft\db\Query;
use Solspace\Freeform\Library\Configuration\FormBehaviorUpgrade;
use Solspace\Freeform\Library\Migrations\Craft6SchemaMigration;
use Solspace\Freeform\Models\Settings;
use Solspace\Freeform\Records\FormRecord;

class m261116_183000_SimplifyFormBehavior extends Craft6SchemaMigration
{
    public function safeUp(): bool
    {
        $config = \Craft::$app->projectConfig;
        $schema = $config->get('plugins.freeform.schemaVersion', true);
        if (!$config->readOnly && (null === $schema || version_compare($schema, '6.0.3', '<'))) {
            $stored = $config->get('plugins.freeform.settings');
            if (\is_array($stored)) {
                $updated = Settings::normalizeLegacySettings($stored, preserveExportFormatting: true);
                if ($updated !== $stored) {
                    $config->set('plugins.freeform.settings', $updated, 'Consolidate processing feedback and remove retired form behavior settings.');
                }
            }
        }
        foreach ((new Query())->select(['id', 'metadata'])->from(FormRecord::TABLE)->each() as $row) {
            $metadata = \is_array($row['metadata']) ? $row['metadata'] : json_decode($row['metadata'], true, flags: \JSON_THROW_ON_ERROR);
            $updated = FormBehaviorUpgrade::metadata($metadata);
            if ($metadata !== $updated) {
                $this->update(FormRecord::TABLE, ['metadata' => json_encode($updated, \JSON_THROW_ON_ERROR)], ['id' => $row['id']]);
            }
        }

        return true;
    }

    public function safeDown(): bool
    {
        return false;
    }
}
