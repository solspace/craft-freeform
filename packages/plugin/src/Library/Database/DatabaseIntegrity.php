<?php

namespace Solspace\Freeform\Library\Database;

use craft\db\Connection;
use Solspace\Freeform\migrations\Install;

class DatabaseIntegrity
{
    public function __construct(private Connection $db) {}

    public function getDefinitions(): array
    {
        $definitions = (new Install(['db' => $this->db]))->getTableDefinitions();
        $pattern = '/^'.preg_quote($this->db->tablePrefix, '/').'freeform_submissions_.*_\d+$/D';
        foreach ($this->db->getSchema()->getTableNames() as $name) {
            if (preg_match($pattern, $name)) {
                $definitions[] = ['table' => $name, 'columns' => ['id'], 'indexes' => [['columns' => ['id'], 'unique' => true, 'primary' => true]]];
            }
        }

        return $definitions;
    }

    /**
     * Schema metadata plus the small forms configuration table; never submission rows.
     */
    public function inspect(): array
    {
        $issues = [];
        foreach ($this->getDefinitions() as $definition) {
            $issues = array_merge($issues, $this->inspectTable($definition));
        }

        if ($this->db->getSchema()->getTableSchema('{{%freeform_forms}}')) {
            $formTables = [];
            $pattern = '/^'.preg_quote($this->db->tablePrefix, '/').'freeform_submissions_.*_(\d+)$/D';
            foreach ($this->db->getSchema()->getTableNames() as $name) {
                if (preg_match($pattern, $name, $matches)) {
                    $formTables[(int) $matches[1]] = true;
                }
            }
            foreach ($this->db->createCommand('SELECT [[id]] FROM {{%freeform_forms}}')->queryColumn() as $formId) {
                if (!isset($formTables[(int) $formId])) {
                    $issues[] = ['relationship' => 'Form #'.$formId, 'message' => 'The per-form submission table is missing. Ask your developer to investigate before resaving the form; recreating a table does not recover lost data.'];
                }
            }
        }

        return $issues;
    }

    public function inspectTable(array $definition): array
    {
        $schema = $this->db->getSchema();
        $name = $schema->getRawTableName($definition['table']);
        $table = $schema->getTableSchema($name);
        if (!$table) {
            return [['relationship' => $name, 'message' => 'A required table is missing. Complete pending Freeform migrations or ask your developer to investigate.']];
        }

        $issues = [];
        $missing = array_diff($definition['columns'], array_keys($table->columns));
        if ($missing) {
            $issues[] = ['relationship' => $name, 'message' => 'Required columns are missing: '.implode(', ', $missing).'.'];
        }

        foreach ($definition['indexes'] as $index) {
            if (array_diff($index['columns'], array_keys($table->columns))) {
                continue;
            }
            if (!$this->hasIndex($name, $index)) {
                $type = $index['primary'] ? 'primary key' : ($index['unique'] ? 'unique constraint' : 'index');
                $issues[] = ['relationship' => $name.' ('.implode(', ', $index['columns']).')', 'message' => 'An expected '.$type.' is missing. Ask your developer to review the schema.'];
            }
        }

        return $issues;
    }

    public function hasIndex(string $table, array $expected): bool
    {
        foreach ($this->db->getSchema()->getTableIndexes($table) as $actual) {
            if ($expected['primary'] && !$actual->isPrimary) {
                continue;
            }
            if ($expected['unique']) {
                if ($actual->isUnique && \count($actual->columnNames) === \count($expected['columns']) && !array_diff($actual->columnNames, $expected['columns'])) {
                    return true;
                }
            } elseif (\array_slice($actual->columnNames, 0, \count($expected['columns'])) === $expected['columns']) {
                // A wider index with the same leading columns covers this lookup.
                return true;
            }
        }

        return false;
    }
}
