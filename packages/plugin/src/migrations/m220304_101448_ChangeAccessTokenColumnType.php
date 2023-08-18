<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

/**
 * m220304_101448_ChangeAccessTokenColumnType migration.
 */
class m220304_101448_ChangeAccessTokenColumnType extends Migration
{
    public function safeUp()
    {
        if ($this->db->getIsPgsql()) {
            // Manually construct the SQL for Postgres
            // (see https://github.com/yiisoft/yii2/issues/12077)
            $this->execute('ALTER TABLE {{%freeform_integrations}} ALTER COLUMN [[accessToken]] TYPE TEXT');
        } else {
            $this->alterColumn('{{%freeform_integrations}}', 'accessToken', $this->text());
        }

        return true;
    }

    public function safeDown()
    {
        if ($this->db->getIsPgsql()) {
            // Manually construct the SQL for Postgres
            // (see https://github.com/yiisoft/yii2/issues/12077)
            $this->execute('ALTER TABLE {{%freeform_integrations}} ALTER COLUMN [[accessToken]] TYPE VARCHAR(255)');
        } else {
            $this->alterColumn('{{%freeform_integrations}}', 'accessToken', $this->string(255));
        }

        return false;
    }
}
