<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

/**
 * m231229_155623_CreateSurveysViewSettingsTable migration.
 */
class m231229_155623_CreateSurveysViewSettingsTable extends Migration
{
    public function safeUp(): bool
    {
        $this->createTable(
            '{{%freeform_surveys_view_settings}}',
            [
                'id' => $this->primaryKey(),
                'userId' => $this->integer()->notNull(),
                'fieldId' => $this->integer()->notNull(),
                'chartType' => $this->string(200)->notNull(),
                'dateCreated' => $this->dateTime()->notNull(),
                'dateUpdated' => $this->dateTime()->notNull(),
                'uid' => $this->uid(),
            ]
        );

        $this->addForeignKey(
            null,
            '{{%freeform_surveys_view_settings}}',
            'userId',
            '{{%users}}',
            'id',
            'CASCADE'
        );

        $this->addForeignKey(
            null,
            '{{%freeform_surveys_view_settings}}',
            'fieldId',
            '{{%freeform_forms_fields}}',
            'id',
            'CASCADE'
        );

        return true;
    }

    public function safeDown(): bool
    {
        $this->dropTableIfExists('{{%freeform_surveys_view_settings}}');

        return true;
    }
}
