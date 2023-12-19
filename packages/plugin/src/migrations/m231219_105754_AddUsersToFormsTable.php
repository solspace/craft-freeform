<?php

namespace Solspace\Freeform\migrations;

use Craft;
use craft\db\Migration;

/**
 * m231219_105754_AddUsersToFormsTable migration.
 */
class m231219_105754_AddUsersToFormsTable extends Migration
{
    /**
     * @inheritdoc
     */
    public function safeUp(): bool
    {
        $this->addColumn(
            '{{%freeform_forms}}',
            'createdId',
            $this->integer()->null()->after('order')
        );

        $this->addColumn(
            '{{%freeform_forms}}',
            'updatedId',
            $this->integer()->null()->after('dateCreated')
        );

        $this->addForeignKey(
            null,
            '{{%freeform_forms}}',
            'createdId',
            '{{%users}}',
            'id'
        );

        $this->addForeignKey(
            null,
            '{{%freeform_forms}}',
            'updatedId',
            '{{%users}}',
            'id'
        );

        return true;
    }

    /**
     * @inheritdoc
     */
    public function safeDown(): bool
    {
        $this->dropForeignKey('freeform_forms_createdId_fk', '{{%freeform_forms}}');
        $this->dropForeignKey('freeform_forms_updatedId_fk', '{{%freeform_forms}}');

        $this->dropColumn(
            '{{%freeform_forms}}',
            'createdId',
        );

        $this->dropColumn(
            '{{%freeform_forms}}',
            'updatedId',
        );

        return true;
    }
}
