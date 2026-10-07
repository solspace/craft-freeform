<?php

namespace Solspace\Freeform\Library\Diagnostics;

use craft\db\Connection;
use craft\db\Query;
use craft\elements\Asset;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Fields\Implementations\Pro\TableField;
use Solspace\Freeform\Fields\Interfaces\FileUploadInterface;
use Solspace\Freeform\Library\Helpers\EncryptionHelper;

/**
 * Reads stored upload values directly, without hydrating forms or modifying assets.
 */
class UploadIntegrityScan
{
    private const BATCH_SIZE = 25;

    private \Closure $checkAsset;
    private \Closure $decrypt;

    public function __construct(private Connection $db, ?\Closure $checkAsset = null, ?\Closure $decrypt = null)
    {
        $this->decrypt = $decrypt ?? static fn (string $value, string $formUid) => EncryptionHelper::decrypt(EncryptionHelper::getKey($formUid), $value);
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
            ->select(['field.*', 'form.name AS formName', 'form.handle AS formHandle', 'form.uid AS formUid'])
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
                'formId' => (int) $field['formId'],
                'formUid' => $field['formUid'],
                'field' => $metadata['label'] ?? $metadata['handle'] ?? (string) $field['id'],
                'columns' => $columns,
                'invalid' => $invalid,
            ];
        }

        return $tasks;
    }

    public function scanTask(array $task, int $cursor = 0, ?int $maxId = null, int $offset = 0): array
    {
        $result = ['cursor' => $cursor, 'maxId' => $maxId, 'offset' => $offset, 'scanned' => 0, 'complete' => true, 'results' => []];
        $context = ['form' => $task['form'], 'formId' => $task['formId'] ?? 0, 'field' => $task['field']];
        if ($task['invalid']) {
            $result['results'][] = $this->issue($context, 'This upload field could not be checked because its configuration is unreadable.', true);

            return $result;
        }

        try {
            $maxId ??= (int) (new Query())->from($task['table'])->max('id', $this->db);
            $result['maxId'] = $maxId;
            $site = (new Query())->select(['site.handle'])->from('{{%elements_sites}} elementSite')
                ->innerJoin('{{%sites}} site', '[[site.id]] = [[elementSite.siteId]]')
                ->where('[[elementSite.elementId]] = [[content.id]]')
                ->orderBy(['elementSite.siteId' => \SORT_ASC])->limit(1)
            ;
            $rows = (new Query())->select([
                'content.id', 'content.'.$task['column'], 'submission.id AS submissionId',
                'submission.isSpam', 'element.id AS elementId', 'element.dateDeleted', 'siteHandle' => $site,
            ])->from(['content' => $task['table']])
                ->leftJoin('{{%freeform_submissions}} submission', '[[submission.id]] = [[content.id]] AND [[submission.formId]] = :formId', [':formId' => $task['formId'] ?? 0])
                ->leftJoin('{{%elements}} element', '[[element.id]] = [[submission.id]]')
                ->where(['and', ['>', 'content.id', $cursor], ['<=', 'content.id', $maxId]])
                ->orderBy(['content.id' => \SORT_ASC])->limit(self::BATCH_SIZE)->all($this->db)
            ;
        } catch (\Throwable) {
            $result['results'][] = $this->issue($context, 'The stored upload column could not be read. Check the database structure.', true);

            return $result;
        }

        // Both database rows and storage lookups are bounded per request. The offset
        // resumes a submission with many files without checking earlier files again.
        $checked = [];
        $lookups = 0;
        $baseContext = $context;
        foreach ($rows as $row) {
            $context = $baseContext + [
                'submission' => (int) $row['id'],
                'submissionAvailable' => null !== $row['submissionId'] && null !== $row['elementId'] && null === $row['dateDeleted'] && !empty($row['siteHandle']),
                'isSpam' => (bool) $row['isSpam'],
                'siteHandle' => $row['siteHandle'],
            ];

            $value = $row[$task['column']];
            // Trash retains submission content for restoration. It is not an
            // active upload problem and its normal editor cannot be opened.
            if (null !== $row['dateDeleted']) {
                $result['cursor'] = (int) $row['id'];
                $result['offset'] = 0;

                continue;
            }
            if (!$context['submissionAvailable']) {
                if (null !== $value && !\in_array(trim((string) $value), ['', '[]', 'null'], true)) {
                    $message = match (true) {
                        null === $row['submissionId'] => 'The stored upload row has no matching submission. Run the Related Data Integrity check to investigate.',
                        null === $row['elementId'] => 'The submission has no matching Craft element. Run the Orphaned Submissions check to investigate.',
                        default => 'The submission has no site record and cannot be opened. Check the database integrity.',
                    };
                    if (null === $row['submissionId'] || null === $row['elementId']) {
                        $context['integrityCheck'] = null === $row['submissionId'] ? 'related' : 'orphan';
                    }
                    $result['results'][] = $this->issue($context, $message);
                }
                $result['cursor'] = (int) $row['id'];
                $result['offset'] = 0;

                continue;
            }
            if (\is_string($value) && str_starts_with($value, 'encrypted:')) {
                try {
                    if (empty($task['formUid'])) {
                        throw new \UnexpectedValueException('Missing form UID.');
                    }
                    $value = ($this->decrypt)($value, $task['formUid']);
                    if (!\is_string($value)) {
                        throw new \UnexpectedValueException('Unable to decrypt upload value.');
                    }
                } catch (\Throwable) {
                    $result['results'][] = $this->issue($context, 'This encrypted upload value could not be decrypted with the current site key and was not checked.', true, true);
                    $result['cursor'] = (int) $row['id'];
                    $result['offset'] = 0;

                    continue;
                }
            }

            try {
                $ids = $this->getAssetIds($value, $task['columns']);
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

    private function issue(array $context, string $message, bool $skipped = false, bool $informational = false): array
    {
        return ['context' => $context, 'message' => $message, 'skipped' => $skipped, 'informational' => $informational];
    }
}
