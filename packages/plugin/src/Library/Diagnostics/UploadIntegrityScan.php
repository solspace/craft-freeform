<?php

namespace Solspace\Freeform\Library\Diagnostics;

use craft\db\Connection;
use craft\db\Query;
use craft\elements\Asset;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Fields\Implementations\Pro\TableField;
use Solspace\Freeform\Fields\Interfaces\FileUploadInterface;

/**
 * Reads stored upload values directly, without hydrating forms or modifying assets.
 */
class UploadIntegrityScan
{
    private const BATCH_SIZE = 25;

    private \Closure $checkAsset;

    public function __construct(private Connection $db, ?\Closure $checkAsset = null)
    {
        $this->checkAsset = $checkAsset ?? static function (int $id): ?string {
            $asset = \Craft::$app->getElements()->getElementById($id, Asset::class, '*');
            if (!$asset) {
                return 'The referenced asset no longer exists.';
            }

            return $asset->getVolume()->fileExists($asset->getPath()) ? null : 'The asset exists, but its stored file is missing.';
        };
    }

    public function getTasks(): array
    {
        $fields = (new Query())
            ->select(['field.*', 'form.name AS formName', 'form.handle AS formHandle'])
            ->from('{{%freeform_forms_fields}} field')
            ->innerJoin('{{%freeform_forms}} form', '[[form.id]] = [[field.formId]]')
            ->orderBy(['field.id' => \SORT_ASC])
            ->all($this->db)
        ;
        $tasks = [];
        foreach ($fields as $field) {
            $tableField = $field['type'] === TableField::class;
            if (!$tableField && !is_a($field['type'], FileUploadInterface::class, true)) {
                continue;
            }
            $metadata = json_decode($field['metadata'], true);
            $columns = [];
            $invalid = !\is_array($metadata) || ($tableField && !\is_array($metadata['tableLayout'] ?? []));
            if ($tableField && !$invalid) {
                foreach ($metadata['tableLayout'] ?? [] as $index => $column) {
                    if (!\is_array($column)) {
                        $invalid = true;

                        break;
                    }
                    if (($column['type'] ?? null) === TableField::COLUMN_TYPE_FILE) {
                        $columns[] = $index;
                    }
                }
                if (!$columns && !$invalid) {
                    continue;
                }
            }
            $tasks[] = [
                'table' => Submission::generateContentTableName((int) $field['formId'], $field['formHandle']),
                'column' => Submission::generateFieldColumnName((int) $field['id'], $metadata['handle'] ?? ''),
                'form' => $field['formName'],
                'field' => $metadata['label'] ?? $metadata['handle'] ?? (string) $field['id'],
                'columns' => $columns,
                'encrypted' => $metadata['encrypted'] ?? false,
                'invalid' => $invalid,
            ];
        }

        return $tasks;
    }

    public function scanTask(array $task, int $cursor = 0, ?int $maxId = null, int $offset = 0): array
    {
        $result = ['cursor' => $cursor, 'maxId' => $maxId, 'offset' => $offset, 'scanned' => 0, 'complete' => true, 'results' => []];
        $context = ['form' => $task['form'], 'field' => $task['field']];
        if ($task['encrypted'] || $task['invalid']) {
            $message = $task['encrypted']
                ? 'Encrypted upload values were not checked. Encryption is enabled for this field.'
                : 'This upload field could not be checked because its configuration is unreadable.';
            $result['results'][] = $this->issue($context, $message, true);

            return $result;
        }

        try {
            $maxId ??= (int) (new Query())->from($task['table'])->max('id', $this->db);
            $result['maxId'] = $maxId;
            $rows = (new Query())->select(['id', $task['column']])->from($task['table'])
                ->where(['and', ['>', 'id', $cursor], ['<=', 'id', $maxId]])
                ->orderBy(['id' => \SORT_ASC])->limit(self::BATCH_SIZE)->all($this->db)
            ;
        } catch (\Throwable) {
            $result['results'][] = $this->issue($context, 'The stored upload column could not be read. Check the database structure.', true);

            return $result;
        }

        // Both database rows and storage lookups are bounded per request. The offset
        // resumes a submission with many files without checking earlier files again.
        $checked = [];
        $lookups = 0;
        foreach ($rows as $row) {
            $context['submission'] = (int) $row['id'];

            try {
                $ids = $this->getAssetIds($row[$task['column']], $task['columns']);
            } catch (\Throwable) {
                $result['results'][] = $this->issue($context, 'The stored upload value could not be read.', true);
                $ids = [];
            }
            foreach (\array_slice($ids, $result['offset']) as $id) {
                try {
                    if (!\array_key_exists($id, $checked)) {
                        $checked[$id] = ($this->checkAsset)($id);
                    }
                    ++$result['scanned'];
                    if (null !== $checked[$id]) {
                        $result['results'][] = $this->issue($context + ['asset' => $id], $checked[$id]);
                    }
                } catch (\Throwable) {
                    $result['results'][] = $this->issue($context + ['asset' => $id], 'The asset storage could not be checked. Check the volume connection and permissions.', true);
                }
                ++$result['offset'];
                if (++$lookups >= self::BATCH_SIZE) {
                    if ($result['offset'] >= \count($ids)) {
                        $result['cursor'] = (int) $row['id'];
                        $result['offset'] = 0;
                    }
                    $result['complete'] = $result['cursor'] >= $maxId;

                    return $result;
                }
            }
            $result['cursor'] = (int) $row['id'];
            $result['offset'] = 0;
        }
        $result['complete'] = \count($rows) < self::BATCH_SIZE || $result['cursor'] >= $maxId;

        return $result;
    }

    private function getAssetIds(mixed $value, array $columns): array
    {
        if (null === $value || '' === $value) {
            return [];
        }
        $value = \is_string($value) ? json_decode($value, true, flags: \JSON_THROW_ON_ERROR) : $value;
        if (!\is_array($value)) {
            throw new \UnexpectedValueException('Invalid upload value.');
        }
        if ($columns) {
            $ids = [];
            foreach ($value as $row) {
                if (!\is_array($row)) {
                    throw new \UnexpectedValueException('Invalid table row.');
                }
                foreach ($columns as $column) {
                    $cell = $row[$column] ?? [];
                    if (!\is_array($cell)) {
                        throw new \UnexpectedValueException('Invalid table upload value.');
                    }
                    $ids = array_merge($ids, $cell);
                }
            }
            $value = $ids;
        }
        foreach ($value as $id) {
            if (false === filter_var($id, \FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]])) {
                throw new \UnexpectedValueException('Invalid asset ID.');
            }
        }

        return array_map(intval(...), $value);
    }

    private function issue(array $context, string $message, bool $skipped = false): array
    {
        return ['context' => $context, 'message' => $message, 'skipped' => $skipped];
    }
}
