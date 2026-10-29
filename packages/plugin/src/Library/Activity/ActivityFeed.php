<?php

namespace Solspace\Freeform\Library\Activity;

use craft\db\Query;
use yii\db\Expression;

/** Read-only grouping. Persisted events and their retention rules stay unchanged. */
class ActivityFeed
{
    public const PAGE_SIZE = 50;

    public static function chainKey(array $row, bool $grouped = true): string
    {
        return $grouped && !empty($row['submissionId'])
            ? 'submission:'.($row['formId'] ?? 0).':'.$row['submissionId']
            : 'event:'.$row['id'];
    }

    public static function page(Query $query, string $cutoff, int $before = 0, bool $grouped = true, int $after = 0): array
    {
        if (!$grouped) {
            $query = clone $query;
            $total = (int) (clone $query)->count();
            if ($before) {
                $query->andWhere(['<', 'id', $before]);
            }
            if ($after) {
                $query->andWhere(['>', 'id', $after]);
            }
            $rows = $query->orderBy(['id' => $after ? \SORT_ASC : \SORT_DESC])->limit(self::PAGE_SIZE + 1)->all();
            $hasMore = \count($rows) > self::PAGE_SIZE;
            $rows = \array_slice($rows, 0, self::PAGE_SIZE);
            if ($after) {
                $rows = array_reverse($rows);
            }
            foreach ($rows as &$row) {
                $row['chainKey'] = self::chainKey($row, false);
                $row['cursor'] = (int) $row['id'];
            }
            unset($row);

            return ['rows' => $rows, 'hasMore' => $hasMore, 'total' => $total, 'previousCursor' => $rows ? (int) $rows[0]['cursor'] : 0, 'nextCursor' => $rows ? (int) $rows[array_key_last($rows)]['cursor'] : 0];
        }

        // Aggregate only keys, never payloads. Apply the cursor after grouping so a
        // submission cannot reappear on older pages under a different event ID.
        $submissions = (clone $query)->select(['id' => new Expression('MAX([[id]])'), 'formId', 'submissionId'])
            ->andWhere(['not', ['submissionId' => null]])->groupBy(['formId', 'submissionId'])
        ;
        $standalone = (clone $query)->select(['id', 'formId', 'submissionId'])->andWhere(['submissionId' => null]);
        $keyQuery = (new Query())->select(['id', 'formId', 'submissionId'])->from(['activityKeys' => $submissions->union($standalone, true)]);
        $total = (int) (clone $keyQuery)->count();
        if ($before) {
            $keyQuery->andWhere(['<', 'id', $before]);
        }
        if ($after) {
            $keyQuery->andWhere(['>', 'id', $after]);
        }
        $keys = $keyQuery->orderBy(['id' => $after ? \SORT_ASC : \SORT_DESC])->limit(self::PAGE_SIZE + 1)->all();
        $hasMore = \count($keys) > self::PAGE_SIZE;
        $keys = \array_slice($keys, 0, self::PAGE_SIZE);
        if ($after) {
            $keys = array_reverse($keys);
        }
        if (!$keys) {
            return ['rows' => [], 'hasMore' => false, 'total' => $total, 'previousCursor' => 0, 'nextCursor' => 0];
        }

        $conditions = ['or'];
        foreach ($keys as $key) {
            if ($key['submissionId']) {
                $conditions[] = ['formId' => $key['formId'], 'submissionId' => $key['submissionId']];
            }
        }
        $summaries = [];
        if (\count($conditions) > 1) {
            // One bounded batch of groups. The summary includes the complete retained
            // chain, even when a category/outcome filter only matched one of its steps.
            $summaryRows = (new Query())->from(ActivityTable::TABLE)
                ->select([
                    'formId', 'submissionId', 'count' => new Expression('COUNT(*)'),
                    'errorId' => new Expression("MAX(CASE WHEN [[level]] = 'error' THEN [[id]] END)"),
                    'warningId' => new Expression("MAX(CASE WHEN [[level]] = 'warning' THEN [[id]] END)"),
                    'latestId' => new Expression('MAX([[id]])'),
                ])->where($conditions)->andWhere(['>=', 'dateCreated', $cutoff])->groupBy(['formId', 'submissionId'])->all()
            ;
            foreach ($summaryRows as $summary) {
                $summaries[self::chainKey($summary)] = $summary;
            }
        }
        $ids = array_column($keys, 'id');
        foreach ($summaries as $summary) {
            $ids[] = $summary['errorId'] ?? $summary['warningId'] ?? $summary['latestId'];
        }
        $records = (new Query())->from(ActivityTable::TABLE)->where(['id' => array_unique($ids)])->indexBy('id')->all();
        $rows = [];
        foreach ($keys as $key) {
            $chainKey = self::chainKey($key);
            $summary = $summaries[$chainKey] ?? null;
            $head = $summary ? ($summary['errorId'] ?? $summary['warningId'] ?? $summary['latestId']) : $key['id'];
            $row = $records[$head] ?? null;
            $latest = $records[$key['id']] ?? null;
            // A concurrent cleanup may have removed a record between these bounded reads.
            if (!$row || !$latest) {
                continue;
            }
            $row['chainKey'] = $chainKey;
            $row['cursor'] = (int) $key['id'];
            $row['latestDate'] = new \DateTimeImmutable($latest['dateCreated'], new \DateTimeZone('UTC'));
            $row['chainCount'] = $summary ? (int) $summary['count'] : 1;
            $row['isChain'] = (bool) $key['submissionId'];
            $rows[] = $row;
        }

        return ['rows' => $rows, 'hasMore' => $hasMore, 'total' => $total, 'previousCursor' => (int) $keys[0]['id'], 'nextCursor' => (int) $keys[array_key_last($keys)]['id']];
    }
}
