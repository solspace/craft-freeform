<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;
use craft\db\Query;

/**
 * m240116_093434_ConvertFieldTypeGroupsToJson migration.
 */
class m240116_093434_ConvertFieldTypeGroupsToJson extends Migration
{
    public function safeUp(): bool
    {
        $formData = (new Query())
            ->select('id, types')
            ->from('{{%freeform_fields_type_groups}}')
            ->all()
        ;

        foreach ($formData as $data) {
            $this->update(
                '{{%freeform_fields_type_groups}}',
                ['types' => json_encode(json_decode($data['types']), \JSON_FORCE_OBJECT)],
                ['id' => $data['id']],
            );
        }

        return true;
    }

    public function safeDown(): bool
    {
        echo "m240116_093434_ConvertFieldTypeGroupsToJson cannot be reverted.\n";

        return false;
    }
}
