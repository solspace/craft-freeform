<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

/**
 * m240724_104556_UpdateLayoutJsonColumnFromTextToLongTextOnFormsTable migration.
 */
class m240724_104556_UpdateLayoutJsonColumnFromTextToLongTextOnFormsTable extends Migration
{
    public function safeUp(): bool
    {
        if ($this->db->getIsPgsql()) {
            // Manually construct the SQL for Postgres
            // (see https://github.com/yiisoft/yii2/issues/12077)
            $this->execute('ALTER TABLE {{%freeform_forms}} ALTER COLUMN [[layoutJson]] TYPE LONGTEXT');
        } else {
            $this->alterColumn('{{%freeform_forms}}', 'layoutJson', $this->longText());
        }

        return true;
    }

    public function safeDown(): bool
    {
        if ($this->db->getIsPgsql()) {
            // Manually construct the SQL for Postgres
            // (see https://github.com/yiisoft/yii2/issues/12077)
            $this->execute('ALTER TABLE {{%freeform_forms}} ALTER COLUMN [[layoutJson]] TYPE TEXT');
        } else {
            $this->alterColumn('{{%freeform_forms}}', 'layoutJson', $this->text());
        }

        return false;
    }
}
