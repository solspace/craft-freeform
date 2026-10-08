<?php

namespace Solspace\Freeform\Library\Database;

use craft\db\Connection;
use Solspace\Freeform\Library\Migrations\ForeignKey;
use Solspace\Freeform\migrations\Install;

/**
 * Inspects Freeform constraints without modifying customer data.
 */
class ForeignKeyRepair
{
    public function __construct(private Connection $db) {}

    public function getDefinitions(): array
    {
        $definitions = (new Install(['db' => $this->db]))->getForeignKeyDefinitions();
        $pattern = '/^'.preg_quote($this->db->tablePrefix, '/').'freeform_submissions_.*_\d+$/D';

        // Inspect physical tables, including tables whose forms have since been deleted.
        foreach ($this->db->getSchema()->getTableNames() as $name) {
            if (preg_match($pattern, $name)) {
                $definitions[] = [null, $name, 'id', '{{%freeform_submissions}}', 'id', ForeignKey::CASCADE, null];
            }
        }

        return $definitions;
    }

    /**
     * @param array{?string, string, array|string, string, array|string, ?string, ?string} $definition
     *
     * @return array{status: string, orphanCount: int, message: string}
     */
    public function inspect(array $definition, bool $checkOrphans = true): array
    {
        [, $table, $columns, $reference, $referenceColumns, $onDelete, $onUpdate] = $definition;
        $columns = (array) $columns;
        $referenceColumns = (array) $referenceColumns;
        $schema = $this->db->getSchema();
        $source = $schema->getTableSchema($table);
        $target = $schema->getTableSchema($reference);

        if (!$source || !$target) {
            return $this->result('blocked', 0, 'A required table is missing. Complete any pending Freeform migrations first.');
        }

        foreach ($columns as $index => $column) {
            if (!isset($source->columns[$column], $target->columns[$referenceColumns[$index]])) {
                return $this->result('blocked', 0, 'A required column is missing. Complete any pending Freeform migrations first.');
            }
        }

        // Diagnostics checks schema metadata only; row scans remain opt-in via the CLI.
        $orphans = $checkOrphans ? $this->countOrphans($table, $columns, $reference, $referenceColumns) : 0;
        $conflicts = [];
        foreach ($schema->getTableForeignKeys($table) as $key) {
            if ($key->columnNames !== $columns) {
                continue;
            }

            if (
                $key->foreignTableName === $target->name
                && (!$target->schemaName || $key->foreignSchemaName === $target->schemaName)
                && $key->foreignColumnNames === $referenceColumns
                && $this->matchesAction($onDelete, $key->onDelete)
                && $this->matchesUpdateAction($definition, $key->onUpdate)
            ) {
                return $this->result(
                    $orphans ? 'blocked' : 'ok',
                    $orphans,
                    $orphans ? 'An existing key has orphaned rows. Review the data before proceeding.' : 'Expected relationship exists.'
                );
            }

            $conflicts[] = $key->name.': '.($key->foreignSchemaName ? $key->foreignSchemaName.'.' : '').$key->foreignTableName
                .' ('.implode(', ', $key->foreignColumnNames).'), ON DELETE '.($key->onDelete ?? 'NO ACTION').', ON UPDATE '.($key->onUpdate ?? 'NO ACTION');
        }

        if ($conflicts) {
            return $this->result('conflict', $orphans, 'An existing key differs from the expected relationship (ON DELETE '.($onDelete ?? 'any').', ON UPDATE '.($onUpdate ?? 'any').'). Existing: '.implode('; ', $conflicts).'. Review it manually.') + [
                'messageTemplate' => 'An existing key differs from the expected relationship (ON DELETE {onDelete}, ON UPDATE {onUpdate}). Existing: {existing}. Review it manually.',
                'messageParams' => ['onDelete' => $onDelete ?? 'any', 'onUpdate' => $onUpdate ?? 'any', 'existing' => implode('; ', $conflicts)],
            ];
        }

        if ($orphans) {
            return $this->result('blocked', $orphans, 'The key is missing and orphaned rows prevent restoration. Review the data before proceeding.');
        }

        return $this->result('missing', 0, $checkOrphans ? 'The missing key can be restored.' : 'The key is missing. Run the console utility to check for orphaned rows before restoring it.');
    }

    /**
     * Restores only a missing constraint, rechecking it immediately before writing.
     */
    public function restore(array $definition): void
    {
        $result = $this->inspect($definition);
        if ('ok' === $result['status']) {
            return;
        }

        if ('missing' !== $result['status']) {
            throw new \RuntimeException($result['message']);
        }

        [, $table, $columns, $reference, $referenceColumns, $onDelete, $onUpdate] = $definition;
        // Stable, prefix-aware names fit both PostgreSQL and MySQL identifier limits.
        $name = 'fk_ff_repair_'.substr(hash('sha256', $this->db->getSchema()->getRawTableName($table).serialize([$columns, $reference, $referenceColumns])), 0, 24);
        $this->db->createCommand()
            ->addForeignKey($name, $table, $columns, $reference, $referenceColumns, $onDelete, $onUpdate)
            ->execute()
        ;
        $this->db->getSchema()->refreshTableSchema($table);
    }

    private function countOrphans(string $table, array $columns, string $reference, array $referenceColumns): int
    {
        $conditions = [];
        $join = [];
        foreach ($columns as $index => $column) {
            $source = 'ff_child.'.$this->db->quoteColumnName($column);
            $target = 'ff_parent.'.$this->db->quoteColumnName($referenceColumns[$index]);
            // Nullable references are valid; for a composite FK, any NULL exempts the row.
            $conditions[] = $source.' IS NOT NULL';
            $join[] = $target.' = '.$source;
        }

        $conditions[] = 'NOT EXISTS (SELECT 1 FROM '.$this->db->quoteTableName($reference)
            .' ff_parent WHERE '.implode(' AND ', $join).')';
        $sql = 'SELECT COUNT(*) FROM '.$this->db->quoteTableName($table)
            .' ff_child WHERE '.implode(' AND ', $conditions);

        return (int) $this->db->createCommand($sql)->queryScalar();
    }

    private function matchesAction(?string $expected, ?string $actual): bool
    {
        // Install definitions which omit an action allow the database/historical migration default.
        return null === $expected || strtoupper($expected) === strtoupper($actual ?? 'NO ACTION');
    }

    private function matchesUpdateAction(array $definition, ?string $actual): bool
    {
        if ($this->matchesAction($definition[6], $actual)) {
            return true;
        }

        // These six upgrade migrations specified only ON DELETE CASCADE. Fresh
        // installs also specify ON UPDATE CASCADE; both shipped variants are valid.
        $historical = [
            '{{%freeform_rules_integrations}}' => ['id' => '{{%freeform_rules}}', 'integrationId' => '{{%freeform_forms_integrations}}'],
            '{{%freeform_rules_submit_form}}' => ['id' => '{{%freeform_rules}}', 'formId' => '{{%freeform_forms}}'],
            '{{%freeform_rules_buttons}}' => ['id' => '{{%freeform_rules}}', 'pageId' => '{{%freeform_forms_pages}}'],
        ];
        $columns = (array) $definition[2];

        return 'CASCADE' === $definition[6]
            && 1 === \count($columns)
            && ($historical[$definition[1]][$columns[0]] ?? null) === $definition[3]
            && ['id'] === (array) $definition[4]
            && \in_array(strtoupper($actual ?? 'NO ACTION'), ['NO ACTION', 'RESTRICT'], true);
    }

    private function result(string $status, int $orphans, string $message): array
    {
        return ['status' => $status, 'orphanCount' => $orphans, 'message' => $message];
    }
}
