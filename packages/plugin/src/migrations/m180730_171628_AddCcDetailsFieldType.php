<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

/**
 * m180730_171628_AddCcDetailsFieldType migration.
 */
class m180730_171628_AddCcDetailsFieldType extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        if ($this->db->getIsPgsql()) {
            // Manually construct the SQL for Postgres
            // (see https://github.com/yiisoft/yii2/issues/12077)
            $this->execute('ALTER TABLE {{%freeform_fields}} ALTER COLUMN [[type]] TYPE VARCHAR(50)');
            $this->execute('ALTER TABLE {{%freeform_fields}} ALTER COLUMN [[type]] SET NOT NULL');
        } else {
            $this->alterColumn(
                '{{%freeform_fields}}',
                'type',
                $this->string(50)->notNull()
            );
        }

        return true;
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        return true;
    }
}
