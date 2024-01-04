<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

class m231229_155623_CreateSurveysPreferencesTable extends Migration
{
    public function safeUp(): bool
    {
        $this->createTable(
            '{{%freeform_survey_preferences}}',
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
            '{{%freeform_survey_preferences}}',
            'userId',
            '{{%users}}',
            'id',
            'CASCADE'
        );

        $this->addForeignKey(
            null,
            '{{%freeform_survey_preferences}}',
            'fieldId',
            '{{%freeform_forms_fields}}',
            'id',
            'CASCADE'
        );

        $this->db->createCommand()
            ->update(
                '{{%freeform_forms}}',
                ['type' => 'Solspace\Freeform\Bundles\Form\Types\Surveys\Survey'],
                ['type' => 'Solspace\SurveysPolls\FormTypes\Survey'],
            )
            ->execute()
        ;

        return true;
    }

    public function safeDown(): bool
    {
        $this->dropTableIfExists('{{%freeform_survey_preferences}}');

        return true;
    }
}
