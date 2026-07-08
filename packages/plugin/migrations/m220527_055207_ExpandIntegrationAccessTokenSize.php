<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

class m220527_055207_ExpandIntegrationAccessTokenSize extends Migration
{
    public function safeUp(): bool
    {
        $existingType = $this->db
            ->getTableSchema('{{%freeform_integrations}}')
            ->getColumn('accessToken')
            ->type
        ;

        if ('TEXT' === $existingType) {
            return true;
        }

        if ($this->db->getIsPgsql()) {
            // Manually construct the SQL for Postgres
            // (see https://github.com/yiisoft/yii2/issues/12077)
            $this->execute('ALTER TABLE {{%freeform_integrations}} ALTER COLUMN [[accessToken]] TYPE TEXT');
        } else {
            $this->alterColumn('{{%freeform_integrations}}', 'accessToken', $this->text());
        }

        return true;
    }

    public function safeDown(): bool
    {
        echo "m220527_055207_ExpandIntegrationAccessTokenSize cannot be reverted.\n";

        return false;
    }
}
