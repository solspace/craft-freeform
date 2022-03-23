<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;
use craft\db\Query;

class m220323_113852_MigrateEmailValuesToString extends Migration
{
    public function safeUp(): bool
    {
        $emailFieldIds = (new Query())
            ->select(['id'])
            ->from('{{%freeform_fields}}')
            ->where(['type' => 'email'])
            ->column()
        ;

        $columnNames = array_map(fn ($id) => "field_{$id}", $emailFieldIds);

        $query = (new Query())
            ->select(['id', ...$columnNames])
            ->from('{{%freeform_submissions}}')
        ;

        foreach ($query->batch() as $rows) {
            foreach ($rows as $row) {
                $id = $row['id'];
                unset($row['id']);

                $modifiedColumns = [];

                foreach ($row as $column => $value) {
                    if (!str_starts_with($value, '[')) {
                        continue;
                    }

                    $values = json_decode($value);
                    $modifiedColumns[$column] = reset($values);
                }

                if (empty($modifiedColumns)) {
                    continue;
                }

                $this->update(
                    '{{%freeform_submissions}}',
                    $modifiedColumns,
                    ['id' => $id]
                );
            }
        }

        return true;
    }

    public function safeDown(): bool
    {
        return true;
    }
}
