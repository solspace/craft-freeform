<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;
use craft\db\Query;
use craft\helpers\StringHelper;
use Solspace\Freeform\Records\Rules\RuleConditionRecord;

class m260629_124043_FixRuleConditionUids extends Migration
{
    public function safeUp(): bool
    {
        $table = RuleConditionRecord::TABLE;
        if (!$this->db->tableExists($table)) {
            return true;
        }

        $rows = (new Query())
            ->select(['id', 'uid'])
            ->from($table)
            ->all($this->db)
        ;

        foreach ($rows as $row) {
            $uid = trim((string) ($row['uid'] ?? ''));

            // Skip valid UUIDs
            if (1 === preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $uid)) {
                continue;
            }

            $this->update(
                $table,
                ['uid' => StringHelper::UUID()],
                ['id' => $row['id']],
                [],
                false
            );
        }

        return true;
    }

    public function safeDown(): bool
    {
        echo "m260629_124043_FixRuleConditionUids cannot be reverted.\n";

        return false;
    }
}
