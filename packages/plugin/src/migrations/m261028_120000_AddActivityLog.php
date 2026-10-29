<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;
use Solspace\Freeform\Library\Activity\ActivityTable;

class m261028_120000_AddActivityLog extends Migration
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
        $config = \Craft::$app->getProjectConfig();
        if (null === $config->get('plugins.freeform.settings.activityMode')) {
            $config->set('plugins.freeform.settings.activityMode', 'minimal', 'Default upgraded Freeform installations to minimal activity logging.');
        }

        return true;
    }

    public function safeDown(): bool
    {
        return false;
    }
}
