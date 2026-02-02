<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;
use craft\db\Query;
use yii\db\Expression;

class m250724_111642_AddDigestDateToNotificationLogTable extends Migration
{
    public function safeUp(): bool
    {
        $column = 'digestDate';
        $table = '{{%freeform_notification_log}}';
        $indexName = 'freeform_notification_log_type_digestDate_unique_idx';

        // Check if table exists before touching anything
        $schema = $this->db->getTableSchema($table);
        if (!$schema) {
            \Craft::warning("Skipping digestDate migration: {$table} does not exist", __METHOD__);

            return true;
        }

        // Determine correct casting expression based on DB driver
        $driver = \Craft::$app->getDb()->getDriverName();

        // Use Yii auto-quoting for column name
        $castDateExpr = 'pgsql' === $driver
            ? 'CAST([[dateCreated]] AS DATE)'
            : 'CAST([[dateCreated]] AS DATE)';

        // Alias should ALWAYS be plain `digestDate`
        $alias = 'digestDate';

        // Add digestDate column if missing
        if (!$schema->getColumn($column)) {
            $this->addColumn(
                $table,
                $column,
                $this->date()->after('type')->null()->defaultValue(null)
            );
        }

        // Populate digestDate from dateCreated where null
        $this->update(
            $table,
            [$column => new Expression($castDateExpr)],
            [$column => null]
        );

        // Dedupe: keep latest ID per (type, digestDate)
        $rows = (new Query())
            ->select([
                'id',
                'type',
                new Expression("{$castDateExpr} AS {$alias}"),
            ])
            ->from($table)
            ->orderBy(['id' => \SORT_DESC])
            ->all()
        ;

        $seen = [];
        foreach ($rows as $row) {
            if (!isset($row['digestDate'])) {
                \Craft::warning(
                    'Skipping row with missing digestDate: '.json_encode($row),
                    __METHOD__
                );

                continue;
            }

            $key = $row['type'].'|'.$row['digestDate'];

            // Remove duplicates
            if (isset($seen[$key])) {
                \Craft::$app->db->createCommand()
                    ->delete($table, ['id' => $row['id']])
                    ->execute()
                ;
            } else {
                $seen[$key] = true;
            }
        }

        // Make digestDate NOT NULL
        $this->alterColumn($table, $column, $this->date()->notNull());

        // Add unique index if missing
        $existingIndexes = \Craft::$app->db->schema->getTableIndexes($table);
        $indexNames = array_map(static fn ($i) => $i->name ?? null, $existingIndexes);

        if (!\in_array($indexName, $indexNames, true)) {
            $this->createIndex(
                $indexName,
                $table,
                ['type', $column],
                true // unique
            );
        }

        return true;
    }

    public function safeDown(): bool
    {
        $column = 'digestDate';
        $table = '{{%freeform_notification_log}}';
        $indexName = 'freeform_notification_log_type_digestDate_unique_idx';

        $schema = $this->db->getTableSchema($table);
        if (!$schema) {
            return true;
        }

        // Drop unique index
        $existingIndexes = \Craft::$app->db->schema->getTableIndexes($table);
        $indexNames = array_map(static fn ($i) => $i->name ?? null, $existingIndexes);

        if (\in_array($indexName, $indexNames, true)) {
            $this->dropIndex($indexName, $table);
        }

        // Drop digestDate column if it exists
        if ($schema->getColumn($column)) {
            $this->dropColumn($table, $column);
        }

        return true;
    }
}
