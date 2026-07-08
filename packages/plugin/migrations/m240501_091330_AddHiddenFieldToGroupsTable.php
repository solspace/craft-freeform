<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;
use Solspace\Freeform\Freeform;

/**
 * m240501_091330_AddHiddenFieldToGroupsTable migration.
 */
class m240501_091330_AddHiddenFieldToGroupsTable extends Migration
{
    public function safeUp(): bool
    {
        $hiddenFieldTypes = Freeform::getInstance()->settings->getSettingsModel()->hiddenFieldTypes;
        $types = json_encode($hiddenFieldTypes);

        $this->insert('{{%freeform_fields_type_groups}}', [
            'label' => '__freeform_hidden__',
            'types' => $types,
        ]);

        return true;
    }

    public function safeDown(): bool
    {
        echo "m240501_091330_AddHiddenFieldToGroupsTable cannot be reverted.\n";

        return false;
    }
}
