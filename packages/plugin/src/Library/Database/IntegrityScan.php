<?php

namespace Solspace\Freeform\Library\Database;

use craft\db\Connection;

/**
 * Explicit scans of related records and unprotected unique values.
 */
class IntegrityScan
{
    public function __construct(private Connection $db) {}

    public function getTasks(): array
    {
        $schema = $this->db->getSchema();
        $relationships = [];
        foreach ((new ForeignKeyRepair($this->db))->getDefinitions() as $definition) {
            $relationships[$schema->getRawTableName($definition[1])][] = $definition;
        }

        $tasks = [];
        foreach ($relationships as $table => $definitions) {
            if ($table === $schema->getRawTableName('{{%freeform_submissions}}')) {
                // The dedicated submission scan reports these separately.
                continue;
            }
            $source = $schema->getTableSchema($table);
            $error = null;
            if (!$source || ['id'] !== $source->primaryKey) {
                $error = 'A required table or its id primary key is missing; this table could not be scanned.';
            }
            foreach ($definitions as $definition) {
                $target = $schema->getTableSchema($definition[3]);
                if (!$source || !$target || array_diff((array) $definition[2], array_keys($source->columns)) || array_diff((array) $definition[4], array_keys($target->columns))) {
                    $error = 'A required table or column is missing; this table could not be scanned.';
                }
                if ($schema->getRawTableName($definition[3]) === $schema->getRawTableName('{{%freeform_submissions}}')) {
                    $elements = $schema->getTableSchema('{{%elements}}');
                    $forms = $schema->getTableSchema('{{%freeform_forms}}');
                    if (!$target || !isset($target->columns['formId']) || !$elements || !isset($elements->columns['id']) || !$forms || !isset($forms->columns['id'])) {
                        $error = 'A required submission parent table or column is missing; this table could not be scanned.';
                    }
                }
            }
            $tasks[] = ['type' => 'orphans', 'table' => $table, 'definitions' => $definitions, 'error' => $error];
        }

        $integrity = new DatabaseIntegrity($this->db);
        foreach ($integrity->getDefinitions() as $definition) {
            $table = $schema->getTableSchema($definition['table']);
            if (!$table) {
                continue;
            }
            foreach ($definition['indexes'] as $index) {
                if (!$index['unique'] || array_diff($index['columns'], array_keys($table->columns)) || $integrity->hasIndex($definition['table'], $index)) {
                    continue;
                }
                $tasks[] = ['type' => 'duplicates', 'table' => $definition['table'], 'columns' => $index['columns'], 'error' => null];
            }
        }

        return $tasks;
    }

    /**
     * Orphans are counted once per table. Duplicate counts include all rows in
     * duplicate groups and are per missing constraint, with nullable values exempt.
     */
    public function scanTask(array $task, int $cursor = 0, ?int $maxId = null): array
    {
        if ($cursor < 0 || (null !== $maxId && $maxId < 0)) {
            throw new \InvalidArgumentException('Scan cursors must be non-negative.');
        }
        if ($task['error']) {
            return ['cursor' => $cursor, 'maxId' => $maxId, 'scanned' => 0, 'affected' => 0, 'complete' => true, 'error' => $task['error']];
        }

        $table = $this->db->quoteTableName($task['table']);
        if ('duplicates' === $task['type']) {
            $columns = array_map(fn ($column) => $this->db->quoteColumnName($column), $task['columns']);
            $conditions = array_map(static fn ($column) => $column.' IS NOT NULL', $columns);
            $sql = 'SELECT COALESCE(SUM(ff_count), 0) FROM (SELECT COUNT(*) AS ff_count FROM '.$table
                .' WHERE '.implode(' AND ', $conditions).' GROUP BY '.implode(', ', $columns).' HAVING COUNT(*) > 1) ff_duplicates';

            return ['cursor' => 0, 'maxId' => null, 'scanned' => 0, 'affected' => (int) $this->db->createCommand($sql)->queryScalar(), 'complete' => true, 'error' => null];
        }

        $maxId ??= (int) $this->db->createCommand('SELECT MAX([[id]]) FROM '.$table)->queryScalar();
        $ids = $this->db->createCommand(
            'SELECT [[id]] FROM '.$table.' WHERE [[id]] > :cursor AND [[id]] <= :maxId ORDER BY [[id]] LIMIT 1000',
            [':cursor' => $cursor, ':maxId' => $maxId]
        )->queryColumn();
        $nextCursor = $ids ? (int) end($ids) : $cursor;
        $count = 0;
        if ($ids) {
            $conditions = [];
            foreach ($task['definitions'] as $definition) {
                [, , $columns, $reference, $referenceColumns] = $definition;
                $present = $joins = [];
                foreach ((array) $columns as $index => $column) {
                    $child = 'ff_child.'.$this->db->quoteColumnName($column);
                    $parent = 'ff_parent.'.$this->db->quoteColumnName(((array) $referenceColumns)[$index]);
                    $present[] = $child.' IS NOT NULL';
                    $joins[] = $child.' = '.$parent;
                }
                $from = $this->db->quoteTableName($reference).' ff_parent';
                if ($this->db->getSchema()->getRawTableName($reference) === $this->db->getSchema()->getRawTableName('{{%freeform_submissions}}')) {
                    // Retained child data also matters when its immediate submission
                    // still exists but the Craft element or form has been purged.
                    $from .= ' INNER JOIN {{%elements}} ff_element ON [[ff_element.id]] = [[ff_parent.id]]'
                        .' INNER JOIN {{%freeform_forms}} ff_form ON [[ff_form.id]] = [[ff_parent.formId]]';
                }
                $conditions[] = '('.implode(' AND ', $present).' AND NOT EXISTS (SELECT 1 FROM '.$from.' WHERE '.implode(' AND ', $joins).'))';
            }
            $sql = 'SELECT COUNT(*) FROM '.$table.' ff_child WHERE [[ff_child.id]] > :cursor AND [[ff_child.id]] <= :nextCursor AND ('.implode(' OR ', $conditions).')';
            $count = (int) $this->db->createCommand($sql, [':cursor' => $cursor, ':nextCursor' => $nextCursor])->queryScalar();
        }

        return ['cursor' => $nextCursor, 'maxId' => $maxId, 'scanned' => \count($ids), 'affected' => $count, 'complete' => \count($ids) < 1000 || $nextCursor >= $maxId, 'error' => null];
    }
}
