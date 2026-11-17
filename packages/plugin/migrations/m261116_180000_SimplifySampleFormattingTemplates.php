<?php

namespace Solspace\Freeform\migrations;

use craft\db\Query;
use Solspace\Freeform\Library\Migrations\Craft6SchemaMigration;
use Solspace\Freeform\Library\Templates\SampleTemplateUpgrade;
use Solspace\Freeform\Records\FormRecord;

class m261116_180000_SimplifySampleFormattingTemplates extends Craft6SchemaMigration
{
    public function safeUp(): bool
    {
        $projectConfig = \Craft::$app->projectConfig;
        $path = 'plugins.freeform.settings';
        $stored = $projectConfig->get($path) ?? [];
        $directory = $stored['formTemplateDirectory'] ?? null;
        $incomingSchema = $projectConfig->get('plugins.freeform.schemaVersion', true);
        if (!$projectConfig->readOnly && (null === $incomingSchema || version_compare($incomingSchema, '6.0.2', '<'))) {
            $settings = SampleTemplateUpgrade::settings($stored);
            if ($settings !== $stored) {
                $projectConfig->set($path, $settings, 'Migrate retired and renamed sample formatting templates.');
            }
        }

        foreach ((new Query())->select(['id', 'metadata'])->from(FormRecord::TABLE)->each() as $row) {
            $metadata = \is_array($row['metadata']) ? $row['metadata'] : json_decode($row['metadata'] ?: '{}', true, flags: \JSON_THROW_ON_ERROR);
            if (!\is_array($metadata)) {
                continue;
            }
            $updated = SampleTemplateUpgrade::metadata($metadata, $directory);
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
