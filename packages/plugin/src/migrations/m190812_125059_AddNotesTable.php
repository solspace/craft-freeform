<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;
use Solspace\Commons\Migrations\ForeignKey;

/**
 * m190618_142759_AddFixedForeignKeys migration.
 */
class m190812_125059_AddNotesTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->createTable(
            '{{%freeform_submission_notes}}',
            [
                'id' => $this->primaryKey(),
                'submissionId' => $this->integer()->notNull(),
                'note' => $this->text(),
                'dateCreated' => $this->dateTime(),
                'dateUpdated' => $this->dateTime(),
                'uid' => $this->uid(),
            ]
        );

        $this->addForeignKey(
            null,
            '{{%freeform_submission_notes}}',
            'submissionId',
            '{{%freeform_submissions}}',
            'id',
            ForeignKey::CASCADE
        );

        return true;
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->dropTableIfExists('{{%freeform_submission_notes}}');

        return true;
    }
}
