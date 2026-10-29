<?php

namespace Solspace\Freeform\Library\Activity;

use craft\db\Query;

class ActivityExport
{
    public const LIMIT = 10000;
    private const BATCH_SIZE = 500;
    private const COLUMNS = ['eventId', 'recordedAtUtc', 'eventType', 'level', 'category', 'formId', 'submissionId', 'metadata'];

    /** Short, independent keyset reads. No offset scan or long-lived transaction. */
    public static function rows(Query $query): \Generator
    {
        $query = clone $query;
        $throughId = (int) (clone $query)->max('id');
        $query->andWhere(['<=', 'id', $throughId]);
        $remaining = self::LIMIT;
        while ($remaining > 0) {
            $batch = (clone $query)->select(['id', 'event', 'formId', 'submissionId', 'metadata', 'dateCreated'])
                ->orderBy(['id' => \SORT_DESC])->limit(min(self::BATCH_SIZE, $remaining))->all()
            ;
            if (!$batch) {
                break;
            }
            foreach ($batch as $row) {
                yield $row;
                --$remaining;
            }
            $query->andWhere(['<', 'id', (int) $batch[array_key_last($batch)]['id']]);
        }
    }

    /** @param resource $stream */
    public static function write($stream, iterable $rows, string $format): int
    {
        if (!\in_array($format, ['csv', 'json'], true)) {
            throw new \InvalidArgumentException('Invalid activity export format.');
        }
        if ('csv' === $format) {
            fputcsv($stream, self::COLUMNS, ',', '"', '');
        } else {
            fwrite($stream, "[\n");
        }
        $count = 0;
        foreach ($rows as $row) {
            // Re-apply the storage allowlist. Do not export arbitrary legacy keys or labels.
            $definition = ActivityPolicy::EVENTS[$row['event']] ?? null;
            if (!$definition) {
                continue;
            }
            $metadata = \is_array($row['metadata'] ?? null) ? $row['metadata'] : json_decode($row['metadata'] ?? '{}', true);
            $record = [
                'eventId' => (int) $row['id'],
                'recordedAtUtc' => (new \DateTimeImmutable($row['dateCreated'], new \DateTimeZone('UTC')))->format(\DATE_ATOM),
                'eventType' => $row['event'], 'level' => $definition[3], 'category' => $definition[4],
                'formId' => $row['formId'] ? (int) $row['formId'] : null,
                'submissionId' => $row['submissionId'] ? (int) $row['submissionId'] : null,
                'metadata' => (object) ActivityPolicy::metadata(\is_array($metadata) ? $metadata : []),
            ];
            if ('csv' === $format) {
                $record['metadata'] = json_encode($record['metadata'], \JSON_THROW_ON_ERROR);
                fputcsv($stream, array_values($record), ',', '"', '');
            } else {
                fwrite($stream, ($count ? ",\n" : '').json_encode($record, \JSON_THROW_ON_ERROR));
            }
            if (++$count >= self::LIMIT) {
                break;
            }
        }
        if ('json' === $format) {
            fwrite($stream, "\n]\n");
        }

        return $count;
    }
}
