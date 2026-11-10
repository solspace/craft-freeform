<?php

namespace Solspace\Freeform\migrations;

use Solspace\Freeform\Library\Activity\ActivityTable;
use Solspace\Freeform\Library\Migrations\Craft6SchemaMigration;

class m261028_120000_AddActivityLog extends Craft6SchemaMigration
{
    public function safeUp(): bool
    {
        if (!$this->db->tableExists(ActivityTable::TABLE)) {
            $definition = ActivityTable::definition($this);
            $this->createTable(ActivityTable::TABLE, array_merge($definition->getFieldArray(), [
                'dateCreated' => $this->dateTime()->notNull(),
                'dateUpdated' => $this->dateTime()->notNull(),
                'uid' => $this->uid(),
            ]));
            foreach ($definition->getIndexes() as $index) {
                $this->createIndex($definition->getName().'_'.$index->getName(), ActivityTable::TABLE, $index->getColumns());
            }
        }

        // Upgrade only. Fresh installs use the model's Standard default and Install's table definition.
        $projectConfig = \Craft::$app->projectConfig;
        // Migrations run before deployed YAML is applied. Leave incoming settings intact.
        $schemaVersion = $projectConfig->get('plugins.freeform.schemaVersion', true);
        if ($projectConfig->readOnly || (null !== $schemaVersion && version_compare($schemaVersion, '5.18.0', '>='))) {
            return true;
        }

        if (null === $projectConfig->get('plugins.freeform.settings.activityMode')) {
            $projectConfig->set('plugins.freeform.settings.activityMode', 'minimal', 'Default upgraded Freeform installations to minimal activity logging.');
        }

        return true;
    }

    public function safeDown(): bool
    {
        return false;
    }
}
