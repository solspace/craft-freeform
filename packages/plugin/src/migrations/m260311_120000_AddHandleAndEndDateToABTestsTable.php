<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;
use craft\db\Query;
use craft\helpers\StringHelper;

class m260311_120000_AddHandleAndEndDateToABTestsTable extends Migration
{
    public function safeUp(): bool
    {
        $table = '{{%freeform_ab_tests}}';
        if (!$this->db->tableExists($table)) {
            return true;
        }

        if (!$this->db->columnExists($table, 'endDate')) {
            $this->addColumn($table, 'endDate', $this->dateTime()->null()->after('startDate'));
        }

        if (!$this->db->columnExists($table, 'handle')) {
            $this->addColumn($table, 'handle', $this->string(255)->after('name'));

            $data = (new Query())
                ->select(['name', 'id'])
                ->from('{{%freeform_ab_tests}}')
                ->all()
            ;

            foreach ($data as $row) {
                $this->update(
                    '{{%freeform_ab_tests}}',
                    ['handle' => StringHelper::toHandle($row['name'])],
                    ['id' => $row['id']]
                );
            }

            $this->alterColumn('{{%freeform_ab_tests}}', 'handle', $this->string(255)->notNull()->after('name'));
            $this->createIndex(
                'idx_ab_tests_handle',
                '{{%freeform_ab_tests}}',
                ['handle'],
                true,
            );
        }

        return true;
    }

    public function safeDown(): bool
    {
        $table = '{{%freeform_ab_tests}}';
        if (!$this->db->tableExists($table)) {
            return true;
        }

        if ($this->db->columnExists($table, 'endDate')) {
            $this->dropColumn($table, 'endDate');
        }

        if ($this->db->columnExists($table, 'handle')) {
            $this->dropIndex('idx_ab_tests_handle', '{{%freeform_ab_tests}}');
            $this->dropColumn($table, 'handle');
        }

        return true;
    }
}
