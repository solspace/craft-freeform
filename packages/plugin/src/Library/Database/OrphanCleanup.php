<?php

namespace Solspace\Freeform\Library\Database;

use craft\db\Connection;
use Solspace\Freeform\Library\Migrations\ForeignKey;

/**
 * Cleans only relationships declared by Freeform, including physical content tables.
 */
class OrphanCleanup
{
    public function __construct(private Connection $db) {}

    /**
     * Counts include descendants of orphaned parents, once per table. Nullable
     * SET NULL relationships are cleared instead of deleting their owning rows.
     *
     * @return array<array{table: string, deleted: int, cleared: int}>
     */
    public function run(bool $apply = false): array
    {
        if ($apply) {
            return $this->db->transaction(fn () => $this->clean(true));
        }

        return $this->clean(false);
    }

    protected function createRepair(): ForeignKeyRepair
    {
        return new ForeignKeyRepair($this->db);
    }

    private function clean(bool $apply): array
    {
        $repair = $this->createRepair();
        $schema = $this->db->getSchema();
        $relationships = [];
        foreach ($repair->getDefinitions() as $definition) {
            $result = $repair->inspect($definition, checkOrphans: false);
            if (!\in_array($result['status'], ['ok', 'missing'], true)) {
                throw new \RuntimeException($definition[1].': '.$result['message']);
            }
            $definition[1] = $schema->getRawTableName($definition[1]);
            $definition[3] = $schema->getRawTableName($definition[3]);
            $relationships[$definition[1]][] = $definition;
        }

        // Plan parents before children, then write children before parents. This
        // works with missing or surviving cascades and gives the same preview.
        $plans = [];
        foreach (array_keys($relationships) as $table) {
            $this->plan($table, $relationships, $plans);
        }

        $results = [];
        foreach (array_reverse($plans, true) as $table => $plan) {
            $quoted = $this->db->quoteTableName($table);
            $deleted = $cleared = 0;
            if ($plan['delete']) {
                $deleted = $apply
                    ? $this->db->createCommand()->delete($table, $plan['delete'])->execute()
                    : (int) $this->db->createCommand('SELECT COUNT(*) FROM '.$quoted.' WHERE '.$plan['delete'])->queryScalar();
            }
            foreach ($plan['clear'] as [$columns, $condition]) {
                // Rows already scheduled for deletion must not be counted twice.
                if ($plan['delete']) {
                    $condition = '('.$condition.') AND NOT ('.$plan['delete'].')';
                }
                $cleared += $apply
                    ? $this->db->createCommand()->update($table, array_fill_keys($columns, null), $condition)->execute()
                    : (int) $this->db->createCommand('SELECT COUNT(*) FROM '.$quoted.' WHERE '.$condition)->queryScalar();
            }
            $results[] = ['table' => $table, 'deleted' => $deleted, 'cleared' => $cleared];
        }

        return $results;
    }

    private function plan(string $table, array $relationships, array &$plans, array $path = []): void
    {
        if (isset($plans[$table]) || !isset($relationships[$table])) {
            return;
        }
        if (isset($path[$table])) {
            throw new \RuntimeException('Cyclic Freeform relationships require manual review: '.$table);
        }
        $path[$table] = true;
        $delete = $clear = [];
        foreach ($relationships[$table] as $definition) {
            [, , $columns, $reference, $referenceColumns, $onDelete] = $definition;
            $this->plan($reference, $relationships, $plans, $path);
            $present = $joins = [];
            foreach ((array) $columns as $index => $column) {
                $child = $this->db->quoteTableName($table).'.'.$this->db->quoteColumnName($column);
                $parent = $this->db->quoteTableName($reference).'.'.$this->db->quoteColumnName(((array) $referenceColumns)[$index]);
                // MATCH SIMPLE: any NULL in a composite reference exempts it.
                $present[] = $child.' IS NOT NULL';
                $joins[] = $parent.' = '.$child;
            }
            if ($plans[$reference]['delete'] ?? null) {
                $joins[] = 'NOT ('.$plans[$reference]['delete'].')';
            }
            $condition = '('.implode(' AND ', $present).' AND NOT EXISTS (SELECT 1 FROM '
                .$this->db->quoteTableName($reference).' WHERE '.implode(' AND ', $joins).'))';
            if (ForeignKey::SET_NULL === $onDelete) {
                $clear[] = [(array) $columns, $condition];
            } elseif (ForeignKey::CASCADE === $onDelete) {
                $delete[] = $condition;
            } else {
                throw new \RuntimeException('Unsupported delete action requires manual review: '.$table);
            }
        }
        $plans[$table] = ['delete' => implode(' OR ', $delete), 'clear' => $clear];
    }
}
