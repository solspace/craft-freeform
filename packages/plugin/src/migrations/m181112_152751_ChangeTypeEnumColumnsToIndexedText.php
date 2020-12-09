<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

/**
 * m181112_152751_ChangeTypeEnumColumnsToIndexedText migration.
 */
class m181112_152751_ChangeTypeEnumColumnsToIndexedText extends Migration
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
            $this->execute('ALTER TABLE {{%freeform_integrations}} ALTER COLUMN [[type]] TYPE VARCHAR(50)');
            $this->execute('ALTER TABLE {{%freeform_integrations}} ALTER COLUMN [[type]] SET NOT NULL');

            // Attempt to remove constraints automatically
            try {
                $prefix = $this->db->tablePrefix ?: '';

                $this->execute('ALTER TABLE {{%freeform_fields}} DROP CONSTRAINT '.$prefix.'freeform_fields_type_check;');
                $this->execute('ALTER TABLE {{%freeform_integrations}} DROP CONSTRAINT '.$prefix.'freeform_integrations_type_check;');
            } catch (\Exception $e) {
            }
        } else {
            $this->alterColumn('{{%freeform_fields}}', 'type', $this->string(50)->notNull());
            $this->alterColumn('{{%freeform_integrations}}', 'type', $this->string(50)->notNull());
        }

        $this->createIndex(null, '{{%freeform_fields}}', 'type');
        $this->createIndex(null, '{{%freeform_integrations}}', 'type');

        return true;
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        echo "m181112_152751_ChangeTypeEnumColumnsToIndexedText cannot be reverted.\n";

        return false;
    }
}
