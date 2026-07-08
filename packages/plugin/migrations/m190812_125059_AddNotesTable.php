<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;
use Solspace\Freeform\Library\Migrations\ForeignKey;

/**
 * m190618_142759_AddFixedForeignKeys migration.
 */
class m190812_125059_AddNotesTable extends Migration
{
    public function safeUp(): bool
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

    public function safeDown(): bool
    {
        $this->dropTableIfExists('{{%freeform_submission_notes}}');

        return true;
    }
}
