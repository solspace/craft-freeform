<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

/**
 * m240624_113811_AddArchivedFlagAndDateToFormsTable migration.
 */
class m240624_113811_AddArchivedFlagAndDateToFormsTable extends Migration
{
    public function safeUp(): bool
    {
        $this->addColumn(
            '{{%freeform_forms}}',
            'archived',
            $this->boolean()->notNull()->defaultValue(false)->after('order')
        );

        $this->addColumn(
            '{{%freeform_forms}}',
            'dateArchived',
            $this->dateTime()->null()->after('dateUpdated')
        );

        return true;
    }

    public function safeDown(): bool
    {
        $this->dropColumn('{{%freeform_forms}}', 'archived');
        $this->dropColumn('{{%freeform_forms}}', 'dateArchived');

        return false;
    }
}
