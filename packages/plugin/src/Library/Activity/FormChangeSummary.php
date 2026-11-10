<?php

namespace Solspace\Freeform\Library\Activity;

use craft\db\Query;
use Solspace\Freeform\Records\Form\FormFieldRecord;
use Solspace\Freeform\Records\Form\FormIntegrationRecord;
use Solspace\Freeform\Records\Form\FormNotificationRecord;
use Solspace\Freeform\Records\Form\FormPageRecord;
use Solspace\Freeform\Records\FormRecord;
use yii\db\Expression;

/** Request-local fingerprints only. Neither configurations nor fingerprints enter Activity storage. */
class FormChangeSummary
{
    private const TABLES = [
        'formSettings' => FormRecord::TABLE,
        'fields' => FormFieldRecord::TABLE,
        'pages' => FormPageRecord::TABLE,
        'notifications' => FormNotificationRecord::TABLE,
        'integrations' => FormIntegrationRecord::TABLE,
    ];

    private const COLUMNS = [
        'formSettings' => ['uid', 'name', 'handle', 'type'],
        'fields' => ['uid', 'type', 'rowId', 'order'],
        'pages' => ['uid', 'label', 'layoutId', 'order'],
        'notifications' => ['uid', 'class', 'enabled'],
        'integrations' => ['uid', 'integrationId', 'enabled'],
    ];

    public static function capture(?int $formId): array
    {
        $snapshot = [];
        $db = \Craft::$app->getDb();
        // A failed optional SELECT must not poison an enclosing PostgreSQL transaction.
        if ($db->getTransaction()) {
            return array_fill_keys(array_keys(self::TABLES), null);
        }
        $metadata = 'pgsql' === $db->getDriverName() ? 'CAST([[metadata]] AS TEXT)' : '[[metadata]]';
        foreach (self::TABLES as $area => $table) {
            if (!$formId) {
                $snapshot[$area] = [];

                continue;
            }

            try {
                $columns = self::COLUMNS[$area];
                // Bound data before it crosses the database connection, including large defaults.
                $columns['metadata'] = new Expression('SUBSTRING('.$metadata.', 1, 4097)');
                $rows = (new Query())->select($columns)->from($table)->where(['formSettings' === $area ? 'id' : 'formId' => $formId])->limit(501)->all();
                $snapshot[$area] = self::fingerprints($rows);
            } catch (\Throwable) {
                $snapshot[$area] = null;
            }
        }

        return $snapshot;
    }

    /** Bound CP-only comparison work, including unusually large field/default configurations. */
    public static function fingerprints(array $rows): ?array
    {
        if (\count($rows) > 500) {
            return null;
        }
        $fingerprints = [];
        $bytes = 0;
        foreach ($rows as $row) {
            $id = (string) ($row['uid'] ?? $row['id'] ?? '');
            foreach (['id', 'uid', 'formId', 'dateCreated', 'dateUpdated', 'createdByUserId', 'updatedByUserId', 'spamBlockCount'] as $key) {
                unset($row[$key]);
            }
            if (\is_string($row['metadata'] ?? null) && \strlen($row['metadata']) > 4096) {
                return null;
            }
            $json = json_encode($row, \JSON_THROW_ON_ERROR);
            $bytes += \strlen($json);
            if (\strlen($json) > 65536 || $bytes > 1048576) {
                return null;
            }
            $fingerprints[$id] = hash('sha256', json_encode(self::canonical($row), \JSON_THROW_ON_ERROR));
        }

        return $fingerprints;
    }

    /** Public output is restricted to numeric change counts; unknown areas are ignored. */
    public static function compare(array $before, array $after): array
    {
        $summary = [];
        foreach (array_keys(self::TABLES) as $area) {
            if (!isset($before[$area], $after[$area])) {
                $summary['summaryIncomplete'] = 1;

                continue;
            }
            $old = $before[$area];
            $new = $after[$area];
            if ('formSettings' === $area) {
                if ($old !== $new) {
                    $summary['formSettingsChanged'] = 1;
                }

                continue;
            }
            $counts = [
                'Added' => \count(array_diff_key($new, $old)),
                'Removed' => \count(array_diff_key($old, $new)),
                'Updated' => \count(array_filter(array_intersect_key($new, $old), static fn ($hash, $id) => $hash !== $old[$id], \ARRAY_FILTER_USE_BOTH)),
            ];
            foreach ($counts as $kind => $count) {
                if ($count) {
                    $summary[$area.$kind] = $count;
                }
            }
        }

        return $summary;
    }

    private static function canonical(mixed $value): mixed
    {
        if (\is_string($value) && (str_starts_with($value, '{') || str_starts_with($value, '['))) {
            $decoded = json_decode($value, true);
            if (\is_array($decoded)) {
                $value = $decoded;
            }
        }
        if (\is_array($value)) {
            if (array_keys($value) !== array_keys(array_values($value))) {
                ksort($value);
            }

            return array_map([self::class, 'canonical'], $value);
        }

        return $value;
    }
}
