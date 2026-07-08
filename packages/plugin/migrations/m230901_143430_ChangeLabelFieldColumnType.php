<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

/**
 * m230901_143430_ChangeLabelFieldColumnType migration.
 */
class m230901_143430_ChangeLabelFieldColumnType extends Migration
{
    public function safeUp(): bool
    {
        if ($this->db->getIsPgsql()) {
            // Manually construct the SQL for Postgres
            // (see https://github.com/yiisoft/yii2/issues/12077)
            $this->execute('ALTER TABLE {{%freeform_crm_fields}} ALTER COLUMN [[label]] TYPE TEXT');
        } else {
            $this->alterColumn('{{%freeform_crm_fields}}', 'label', $this->text());
        }

        return true;
    }

    public function safeDown(): bool
    {
        if ($this->db->getIsPgsql()) {
            // Manually construct the SQL for Postgres
            // (see https://github.com/yiisoft/yii2/issues/12077)
            $this->execute('ALTER TABLE {{%freeform_crm_fields}} ALTER COLUMN [[label]] TYPE VARCHAR(255)');
        } else {
            $this->alterColumn('{{%freeform_crm_fields}}', 'label', $this->string(255));
        }

        return false;
    }
}
