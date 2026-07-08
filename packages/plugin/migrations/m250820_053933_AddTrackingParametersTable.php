<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

class m250820_053933_AddTrackingParametersTable extends Migration
{
    public function safeUp(): bool
    {
        if ($this->db->tableExists('{{%freeform_submissions_tracking_parameters}}')) {
            \Craft::warning("Table 'freeform_submissions_tracking_parameters' already exists. Skipping migration.", __METHOD__);

            return true;
        }

        $this->createTable(
            '{{%freeform_submissions_tracking_parameters}}',
            [
                'id' => $this->primaryKey(),
                'submissionId' => $this->integer()->notNull(),
                'name' => $this->string(255)->notNull(),
                'value' => $this->text(),
                'dateCreated' => $this->dateTime()->notNull(),
                'dateUpdated' => $this->dateTime()->notNull(),
                'uid' => $this->uid(),
            ]
        );

        $this->createIndex(
            'submissionId_name',
            '{{%freeform_submissions_tracking_parameters}}',
            ['submissionId', 'name'],
        );

        $this->addForeignKey(
            'fk-freeform_submissions_tracking_parameters-submissionId',
            '{{%freeform_submissions_tracking_parameters}}',
            'submissionId',
            '{{%freeform_submissions}}',
            ['id'],
            'CASCADE'
        );

        return true;
    }

    public function safeDown(): bool
    {
        $this->dropTableIfExists('{{%freeform_submissions_tracking_parameters}}');

        return true;
    }
}
