<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;
use Solspace\Freeform\Elements\Submission;

class m261014_180000_AddDuplicateCheckIdentityToSubmissions extends Migration
{
    public function safeUp(): bool
    {
        if (!$this->db->columnExists(Submission::TABLE, 'duplicateCheckIdentity')) {
            $this->addColumn(Submission::TABLE, 'duplicateCheckIdentity', $this->string(64)->null());
        }

        $this->createIndexIfMissing(Submission::TABLE, ['formId', 'duplicateCheckIdentity']);

        return true;
    }

    public function safeDown(): bool
    {
        if ($this->db->columnExists(Submission::TABLE, 'duplicateCheckIdentity')) {
            $this->dropIndexIfExists(Submission::TABLE, ['formId', 'duplicateCheckIdentity']);
            $this->dropColumn(Submission::TABLE, 'duplicateCheckIdentity');
        }

        return true;
    }
}
