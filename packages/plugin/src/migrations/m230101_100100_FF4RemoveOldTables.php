<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

class m230101_100100_FF4RemoveOldTables extends Migration
{
    public function safeUp(): bool
    {
        $this->removeOldFieldsTable();
        $this->removeUnusedFormColumns();

        return true;
    }

    public function safeDown(): bool
    {
        echo "m230101_100100_FF4RemoveOldTables cannot be reverted.\n";

        return false;
    }

    private function removeOldFieldsTable(): void
    {
        $this->dropTableIfExists('{{%freeform_fields}}');
    }

    private function removeUnusedFormColumns(): void
    {
        $this->dropColumn('{{%freeform_forms}}', 'submissionTitleFormat');
        $this->dropColumn('{{%freeform_forms}}', 'description');
        $this->dropColumn('{{%freeform_forms}}', 'layoutJson');
        $this->dropColumn('{{%freeform_forms}}', 'returnUrl');
        $this->dropColumn('{{%freeform_forms}}', 'defaultStatus');
        $this->dropColumn('{{%freeform_forms}}', 'formTemplateId');
        $this->dropColumn('{{%freeform_forms}}', 'color');
        $this->dropColumn('{{%freeform_forms}}', 'optInDataStorageTargetHash');
        $this->dropColumn('{{%freeform_forms}}', 'limitFormSubmissions');
        $this->dropColumn('{{%freeform_forms}}', 'extraPostUrl');
        $this->dropColumn('{{%freeform_forms}}', 'extraPostTriggerPhrase');
        $this->dropColumn('{{%freeform_forms}}', 'gtmEnabled');
    }
}
