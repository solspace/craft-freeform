<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

/**
 * m240624_113811_AddArchivedDateToFormsTable migration.
 */
class m240624_113811_AddArchivedDateToFormsTable extends Migration
{
    public function safeUp(): bool
    {
        $this->addColumn(
            '{{%freeform_forms}}',
            'dateArchived',
            $this->dateTime()->null()->after('dateUpdated')
        );

        return true;
    }

    public function safeDown(): bool
    {
        $this->dropColumn('{{%freeform_forms}}', 'dateArchived');

        return false;
    }
}
