<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

class m251013_084101_AddIdempotencyKeyToSubmissions extends Migration
{
    public function safeUp(): bool
    {
        if (!$this->db->columnExists('{{%freeform_submissions}}', 'idempotencyKey')) {
            $this->addColumn(
                '{{%freeform_submissions}}',
                'idempotencyKey',
                $this->string(255)->after('isHidden')->null()
            );
            $this->createIndex(
                'idempotencyKey_idx',
                '{{%freeform_submissions}}',
                ['idempotencyKey', 'formId', 'dateCreated'],
            );
        }

        return true;
    }

    public function safeDown(): bool
    {
        if ($this->db->columnExists('{{%freeform_submissions}}', 'idempotencyKey')) {
            $this->dropIndex('idempotencyKey_idx', '{{%freeform_submissions}}');
            $this->dropColumn('{{%freeform_submissions}}', 'idempotencyKey');
        }

        return true;
    }
}
