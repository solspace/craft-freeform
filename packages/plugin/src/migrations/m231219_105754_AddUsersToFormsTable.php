<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;
use Solspace\Commons\Migrations\ForeignKey;

/**
 * m231219_105754_AddUsersToFormsTable migration.
 */
class m231219_105754_AddUsersToFormsTable extends Migration
{
    public function safeUp(): bool
    {
        $this->addColumn(
            '{{%freeform_forms}}',
            'createdByUserId',
            $this->integer()->null()->after('order')
        );

        $this->addColumn(
            '{{%freeform_forms}}',
            'updatedByUserId',
            $this->integer()->null()->after('dateCreated')
        );

        $this->addForeignKey(
            'freeform_forms_createdByUserId_fk',
            '{{%freeform_forms}}',
            'createdByUserId',
            '{{%users}}',
            'id',
            ForeignKey::SET_NULL,
            ForeignKey::CASCADE,
        );

        $this->addForeignKey(
            'freeform_forms_updatedByUserId_fk',
            '{{%freeform_forms}}',
            'updatedByUserId',
            '{{%users}}',
            'id',
            ForeignKey::SET_NULL,
            ForeignKey::CASCADE,
        );

        return true;
    }

    public function safeDown(): bool
    {
        $this->dropForeignKey(
            'freeform_forms_createdByUserId_fk',
            '{{%freeform_forms}}'
        );

        $this->dropForeignKey(
            'freeform_forms_updatedByUserId_fk',
            '{{%freeform_forms}}'
        );

        $this->dropColumn(
            '{{%freeform_forms}}',
            'createdByUserId',
        );

        $this->dropColumn(
            '{{%freeform_forms}}',
            'updatedByUserId',
        );

        return true;
    }
}
