<?php

namespace Solspace\Freeform\Commands;

use Solspace\Freeform\Library\Database\ForeignKeyRepair;
use yii\console\ExitCode;
use yii\helpers\Console;

class DatabaseController extends BaseCommand
{
    /** @var bool add missing keys; the default is a read-only inspection */
    public bool $apply = false;

    /** @var bool inspect without writing, even when --apply is supplied */
    public bool $dryRun = false;

    public function options($actionID): array
    {
        return array_merge(parent::options($actionID), ['apply', 'dryRun']);
    }

    /**
     * Checks Freeform foreign keys and orphaned rows. Use --apply=1 to restore missing keys.
     * Existing constraints and customer data are never removed or changed.
     */
    public function actionRepairForeignKeys(): int
    {
        $write = $this->apply && !$this->dryRun;
        $this->banner('Freeform Database Integrity');
        $this->stdout($write ? "Restoring missing foreign keys.\n" : "Dry run: no database changes will be made.\n");
        $this->stdout("Orphan counts are per relationship and may include the same row more than once.\n\n");
        $repair = $this->createRepair();
        $counts = ['ok' => 0, 'missing' => 0, 'restored' => 0, 'blocked' => 0, 'conflict' => 0, 'failed' => 0];

        try {
            $definitions = $repair->getDefinitions();
        } catch (\Throwable $e) {
            $this->stderr('Could not read the Freeform schema: '.$e->getMessage()."\n", Console::FG_RED);

            return ExitCode::UNSPECIFIED_ERROR;
        }

        foreach ($definitions as $definition) {
            [, $table, $columns, $reference, $referenceColumns] = $definition;
            $label = $table.' ('.implode(', ', (array) $columns).') -> '.$reference.' ('.implode(', ', (array) $referenceColumns).')';

            try {
                $result = $repair->inspect($definition);
                $status = $result['status'];
                if ($write && 'missing' === $status) {
                    $repair->restore($definition);
                    $status = 'restored';
                    $result['message'] = 'The missing key has been restored.';
                }

                ++$counts[$status];
                if ('ok' !== $status) {
                    $this->stdout(strtoupper($status).': '.$label."\n");
                    $this->stdout('  '.$result['message'].' Orphaned rows: '.$result['orphanCount']."\n");
                }
            } catch (\Throwable $e) {
                ++$counts['failed'];
                $this->stderr('FAILED: '.$label.' — '.$e->getMessage()."\n", Console::FG_RED);
            }
        }

        $this->stdout("\nRelationships checked: ".\count($definitions)."\n");
        foreach ($counts as $label => $count) {
            $this->stdout(ucfirst($label).': '.$count."\n");
        }

        if (!$write && $counts['missing']) {
            $this->stdout("\nTo restore unblocked missing keys, run: php craft freeform/database/repair-foreign-keys --apply=1\n");
        }

        if ($counts['blocked'] || $counts['conflict']) {
            $this->stdout("\nReview the reported data/schema issues with your developer before retrying. No orphaned data has been deleted.\n");
        }

        return $counts['missing'] || $counts['blocked'] || $counts['conflict'] || $counts['failed']
            ? ExitCode::UNSPECIFIED_ERROR
            : ExitCode::OK;
    }

    protected function createRepair(): ForeignKeyRepair
    {
        return new ForeignKeyRepair(\Craft::$app->getDb());
    }
}
