<?php

namespace Solspace\Freeform\Library\Database;

use craft\db\Connection;

/**
 * Read-only, bounded scans of submissions whose Craft element or form is missing.
 */
class OrphanedSubmissionScanner
{
    private const BATCH_SIZE = 1000;

    public function __construct(private Connection $db) {}

    /**
     * The initial maximum ID excludes submissions created after the scan starts.
     *
     * @return array{cursor: int, maxId: int, scanned: int, affected: int, complete: bool}
     */
    public function scan(int $cursor = 0, ?int $maxId = null): array
    {
        if ($cursor < 0 || (null !== $maxId && $maxId < 0)) {
            throw new \InvalidArgumentException('Scan cursors must be non-negative.');
        }

        $maxId ??= (int) $this->db->createCommand('SELECT MAX([[id]]) FROM {{%freeform_submissions}}')->queryScalar();
        $ids = $this->db->createCommand(
            'SELECT [[id]] FROM {{%freeform_submissions}} WHERE [[id]] > :cursor AND [[id]] <= :maxId ORDER BY [[id]] LIMIT '.self::BATCH_SIZE,
            [':cursor' => $cursor, ':maxId' => $maxId]
        )->queryColumn();

        $nextCursor = $ids ? (int) end($ids) : $cursor;
        $affected = 0;
        if ($ids) {
            $affected = (int) $this->db->createCommand(
                'SELECT COUNT(*) FROM {{%freeform_submissions}} s WHERE [[s.id]] > :cursor AND [[s.id]] <= :nextCursor AND ('
                .'NOT EXISTS (SELECT 1 FROM {{%elements}} e WHERE [[e.id]] = [[s.id]]) OR ('
                .'[[s.formId]] IS NOT NULL AND NOT EXISTS (SELECT 1 FROM {{%freeform_forms}} f WHERE [[f.id]] = [[s.formId]])))',
                [':cursor' => $cursor, ':nextCursor' => $nextCursor]
            )->queryScalar();
        }

        return [
            'cursor' => $nextCursor,
            'maxId' => $maxId,
            'scanned' => \count($ids),
            'affected' => $affected,
            'complete' => \count($ids) < self::BATCH_SIZE || $nextCursor >= $maxId,
        ];
    }
}
