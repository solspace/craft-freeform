<?php

namespace Solspace\Freeform\Services;

use craft\db\Connection;
use craft\db\Query;
use craft\db\Table;
use craft\helpers\Queue;
use craft\helpers\StringHelper;
use craft\queue\jobs\UpdateSearchIndex;
use Solspace\Freeform\Bundles\Fields\FieldProvider;
use Solspace\Freeform\Bundles\Form\Limiting\LimitedUsers\LimitedUserChecker;
use Solspace\Freeform\Elements\SpamSubmission;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Fields\Interfaces\NoStorageInterface;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Form\Types\Regular;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Forms\Merge\FieldMapping;
use Solspace\Freeform\Library\Forms\Merge\MergeLimits;
use Solspace\Freeform\Library\Forms\Merge\MergeSizeException;
use Solspace\Freeform\Library\Forms\Merge\TextRules;
use Solspace\Freeform\Library\Helpers\BooleanHelper;
use Solspace\Freeform\Library\Helpers\PermissionHelper;
use Solspace\Freeform\Library\Helpers\SitesHelper;
use Solspace\Freeform\Records\Form\FormFieldRecord;
use Solspace\Freeform\Records\Form\FormPageRecord;
use Solspace\Freeform\Records\Form\FormRowRecord;
use Solspace\Freeform\Records\Form\FormSiteRecord;
use Solspace\Freeform\Records\FormRecord;
use Solspace\Freeform\Records\Pro\Payments\PaymentRecord;

class FormMergeService
{
    private const SEARCH_BATCH_SIZE = 250;

    public static function canAccess(): bool
    {
        return self::hasAccessPermissions()
            && Freeform::getInstance()->edition()->is(Freeform::EDITION_PRO);
    }

    public static function hasAccessPermissions(): bool
    {
        return PermissionHelper::checkPermission(Freeform::PERMISSION_EXPORT_DATA_UTILITY_ACCESS)
            && (
                PermissionHelper::checkPermission(Freeform::PERMISSION_FORMS_MANAGE)
                || PermissionHelper::checkPermission(Freeform::PERMISSION_FORMS_MANAGE.':', true)
            )
            && \Craft::$container->get(LimitedUserChecker::class)->can('layout.fields');
    }

    public static function layoutLock(int $id): string
    {
        return "freeform-form-layout-{$id}";
    }

    /** @return array<int, Form> */
    public function forms(): array
    {
        $service = Freeform::getInstance()->forms;
        $allowed = array_fill_keys($service->getAllowedFormIds(), true);
        $forms = [];
        $sites = SitesHelper::isEnabled() && !PermissionHelper::isAdmin() ? SitesHelper::getEditableSiteHandles() : null;
        if ([] === $sites) {
            return [];
        }
        foreach ($service->getAllNonArchivedForms(orderByName: true, sites: $sites) as $form) {
            if ($form instanceof Regular && isset($allowed[$form->getId()])) {
                $forms[$form->getId()] = $form;
            }
        }

        return $forms;
    }

    public function canMove(Form $source, Form $target): bool
    {
        $allowed = array_fill_keys(Freeform::getInstance()->forms->getAllowedWriteFormIds(), true);

        return PermissionHelper::checkPermission(Freeform::PERMISSION_SUBMISSIONS_ACCESS)
            && isset($allowed[$source->getId()], $allowed[$target->getId()]);
    }

    public function canDelete(): bool
    {
        return PermissionHelper::checkPermission(Freeform::PERMISSION_FORMS_DELETE);
    }

    public function mapping(Form $source, Form $target): array
    {
        $from = $this->fields($source);
        $to = $this->fields($target);
        $pages = [];
        foreach ($target->getPages() as $page) {
            if (!$page->getId()) {
                continue;
            }
            $pages[$page->getId()] = $page->getLabel() ?: Freeform::t('Page {number}', ['number' => $page->getIndex() + 1]);
        }

        if (!MergeLimits::allowsMapping(\count($from), \count($to) + \count($pages), (int) \ini_get('max_input_vars'))) {
            throw new \DomainException(Freeform::t('These form layouts are too large to map on one page. Choose a smaller form pair.'));
        }

        return ['rows' => FieldMapping::rows($from, $to), 'pages' => $pages, 'sourceFields' => $from, 'targetFields' => $to, 'textSources' => array_filter($from, TextRules::supportsField(...)), 'textTargets' => array_filter($to, TextRules::supportsField(...))];
    }

    public function restartMapping(array $mapping, array $saved): array
    {
        ['rows' => $rows, 'pages' => $pages, 'sourceFields' => $from, 'targetFields' => $to] = $mapping;
        $input = $saved['input'];
        $textRules = $saved['textRules'];
        if ($saved['addedColumns']) {
            $targetIds = array_flip(array_map(Submission::getFieldColumnName(...), $to));
            foreach ($saved['addedColumns'] as $id => $column) {
                $targetId = $targetIds[$column] ?? null;
                if (null === $targetId) {
                    throw new \DomainException();
                }
                $input[$id] = (string) $targetId;
            }
        }
        $map = FieldMapping::validate($input, $rows, $pages);
        $textRules = TextRules::validate($textRules, $from, $to, $map);
        foreach ($textRules as $rule) {
            $input[$rule['inputs'][0]] = 'rule:'.$rule['type'];
        }

        return [$input, $textRules];
    }

    public function review(Form $source, Form $target, array $input, bool $move, bool $delete, array $textInput = []): array
    {
        $layout = $this->layoutState($source, $target);
        ['rows' => $rows, 'pages' => $pages, 'sourceFields' => $from, 'targetFields' => $to] = $this->mapping($source, $target);
        $map = FieldMapping::validate($input, $rows, $pages);
        $additions = $this->additions($target, $from, $map);
        $optionMerges = $this->optionMerges($input, $map, $from, $to);
        if ($textInput && !$move) {
            throw new \DomainException(Freeform::t('Turn on moving submissions to use text rules.'));
        }
        $textRules = $this->textRules($textInput, $from, $to, $map);
        $stats = $move ? $this->scan($source, $from, $to, $map, $textRules, $optionMerges) : ['count' => 0, 'omitted' => [], 'invalid' => [], 'payments' => false];
        $problems = [];
        if ($delete && !$move) {
            $problems[] = Freeform::t('Enable submission moving before deleting the original form.');
        }
        foreach ($stats['invalid'] as $id => $count) {
            $message = !isset($optionMerges[$id]) && isset($rows[$id]['optionTargets'][$map[$id]])
                ? '{field} has {count} submissions with choices the selected field in the receiving form cannot store. Try Merge options, add a new field, or change the mapping.'
                : '{field} has {count} submissions with choices the selected field in the receiving form cannot store. Add a new field, map to a different field, or exclude it from the merge.';
            $problems[] = Freeform::t($message, [
                'field' => $rows[$id]['label'],
                'count' => $count,
            ]);
        }
        if ($move || $additions) {
            $problems = array_merge($problems, $this->primaryStorageProblems($target, $to, $move ? $map : [], $textRules));
        }
        if ($move && $this->hasUnavailableSubmissionSites($source, $target)) {
            $problems[] = Freeform::t('Some submissions belong to sites that the receiving form does not support or that you cannot edit.');
        }
        if ($stats['payments']) {
            $problems[] = Freeform::t('This form has submissions with payment records. Turn off submission moving to merge fields only.');
        }
        if (!$additions && !$optionMerges && !$stats['count']) {
            $problems[] = $move
                ? Freeform::t('The original form has no submissions to move. Add a new field or choose another form.')
                : Freeform::t('Add a new field or turn on moving submissions. Mapping to existing fields applies when you move submissions.');
        }

        $changes = $omitted = [];
        foreach ($rows as $id => $row) {
            if (isset($additions[$id])) {
                $addition = $additions[$id];
                $changes[] = [
                    'sourceId' => $id,
                    'addedHandle' => $addition['handle'],
                    'page' => $pages[$addition['pageId']],
                ];
            } elseif (isset($map[$id]) && ($move || isset($optionMerges[$id]))) {
                $changes[] = ['sourceId' => $id, 'targetId' => $map[$id]];
            }
            if (isset($stats['omitted'][$id])) {
                $omitted[$id] = ['label' => $row['label'], 'count' => $stats['omitted'][$id]];
            }
        }

        if ($layout !== $this->layoutState($source, $target)) {
            throw new \DomainException(Freeform::t('The forms changed. Review the merge again.'));
        }
        $signature = hash('sha256', serialize([
            $layout, $map, $optionMerges, $textRules, $stats, $move, $delete,
            \Craft::$app->getUser()->getId(),
        ]));

        return [
            'token' => \Craft::$app->getSecurity()->hashData($signature),
            'map' => $map,
            'count' => $stats['count'],
            'problems' => $problems,
            'changes' => $changes,
            'omitted' => $omitted,
            'additions' => $additions,
            'optionMerges' => $optionMerges,
            'textRules' => $textRules,
            'textExamples' => $problems ? [] : ($stats['textExamples'] ?? []),
        ];
    }

    public function merge(Form $source, Form $target, array $input, bool $move, bool $delete, string $token, ?int $backgroundId = null, ?string $expectedLayout = null, ?callable $onFieldsSaved = null, array $textInput = []): array
    {
        $formIds = [$source->getId(), $target->getId()];
        sort($formIds, \SORT_NUMERIC);
        $mutex = \Craft::$app->getMutex();
        $locks = [];
        $columns = [];
        $targetTable = Submission::getContentTableName($target);
        $db = \Craft::$app->getDb();
        if ($db->getTransaction()) {
            throw new \LogicException('A form merge must run outside an existing transaction.');
        }

        try {
            foreach ($formIds as $id) {
                $key = self::layoutLock($id);
                if (!$mutex->acquire($key, 0)) {
                    throw new \DomainException(Freeform::t('A form is being updated. Review the merge and try again.'));
                }
                $locks[] = $key;
            }

            BackgroundFormMergeService::requireFormsAvailable($formIds, $backgroundId);
            if ($expectedLayout && $expectedLayout !== $this->layoutFingerprint($source, $target)) {
                throw new \DomainException(Freeform::t('A form changed after this review started. Stop the job and review the remaining submissions again.'));
            }
            $additions = [];
            // Only additions need a content review before the transfer transaction, because they require DDL.
            foreach ($input as $destination) {
                if (\is_string($destination) && str_starts_with($destination, 'add:')) {
                    $additions = $this->requireReview($source, $target, $input, $move, $delete, $token, $textInput)['additions'];

                    break;
                }
            }

            if ($additions) {
                // Reserve field IDs before ALTER TABLE. MySQL commits schema changes implicitly.
                // The reserved records are rolled back and stay invisible until the merge commits.
                $reservation = $db->beginTransaction();

                try {
                    foreach ($additions as &$addition) {
                        $addition['record']['id'] = $this->insertField($addition['record']);
                    }
                    unset($addition);
                } finally {
                    $reservation->rollBack();
                }

                $pendingColumns = [];
                foreach ($additions as $addition) {
                    $column = Submission::generateFieldColumnName($addition['record']['id'], $addition['handle']);
                    $pendingColumns[$column] = $addition['record']['id'];
                }
                $this->alterColumns($db, $targetTable, array_keys($pendingColumns), add: true);
                $columns = $pendingColumns;
                $db->getSchema()->refreshTableSchema($targetTable);
            }

            [$submissionIds, $trashed, $optionsMerged] = $db->transaction(function () use ($db, $formIds, $source, $target, $targetTable, $input, $move, $delete, $token, $additions, $backgroundId, $onFieldsSaved, $textInput): array {
                // Block new submissions referencing these forms and lock the source rows during transfer.
                self::lockForms($db, $formIds);
                BackgroundFormMergeService::requireFormsAvailable($formIds, $backgroundId);
                if ($move) {
                    $this->requireSubmissionLimit($source, \count($this->fields($source)));
                    $this->lockSubmissions($db, $source);
                }
                $review = $this->requireReview($source, $target, $input, $move, $delete, $token, $textInput);
                $from = $this->fields($source);
                $to = $this->fields($target);
                $destinations = [];
                foreach ($review['map'] as $sourceId => $targetId) {
                    if (!isset($additions[$sourceId])) {
                        $destinations[$sourceId] = Submission::getFieldColumnName($to[$targetId]);

                        continue;
                    }

                    $addition = $additions[$sourceId];
                    $record = $addition['record'];
                    $record['rowId'] = $this->appendRow($db, $target, $addition['pageId']);
                    $this->insertField($record);
                    $destinations[$sourceId] = Submission::generateFieldColumnName($record['id'], $addition['handle']);
                }

                foreach ($review['optionMerges'] as $sourceId => $options) {
                    $this->appendFieldOptions($db, $target->getId(), (int) $review['map'][$sourceId], $options);
                }
                if ($additions || $review['optionMerges']) {
                    $db->createCommand()->update(FormRecord::TABLE, [
                        'updatedByUserId' => \Craft::$app->getUser()->getId(),
                    ], ['id' => $target->getId()])->execute();
                }

                if ($onFieldsSaved) {
                    $onFieldsSaved($destinations, $this->layoutFingerprint($source, $target));
                }

                $submissionIds = $move
                    ? $this->moveSubmissions($db, $source, $target, $targetTable, $from, $destinations, $review['count'], $review['textRules'])
                    : [];

                return [$submissionIds, $delete && FormTrashService::trashIfEmpty($db, $source->getId()), (bool) $review['optionMerges']];
            });

            $columns = [];
            if ($optionsMerged) {
                Freeform::getInstance()->forms->clearFormCache();
                \Craft::$container->get(FieldProvider::class)->clearCache();
            }
            if ($submissionIds) {
                $this->refreshMovedSubmissions($submissionIds);
            }

            return ['count' => $this->countMoved($submissionIds), 'added' => \count($additions), 'trashed' => $trashed];
        } finally {
            if ($columns) {
                try {
                    // A connection failure after commit must never drop a committed field's data.
                    $committed = (new Query())->select('id')->from(FormFieldRecord::TABLE)->where(['id' => array_values($columns)])->column($db);
                    $unused = array_keys(array_diff($columns, $committed));
                    if ($unused) {
                        $this->alterColumns($db, $targetTable, $unused, add: false);
                        $db->getSchema()->refreshTableSchema($targetTable);
                    }
                } catch (\Throwable $exception) {
                    \Craft::error((string) $exception, __METHOD__);
                }
            }
            foreach (array_reverse($locks) as $key) {
                $mutex->release($key);
            }
        }
    }

    /** Call inside a transaction. Locks are released at the end of each background batch. */
    public static function lockForms(Connection $db, array $ids): void
    {
        sort($ids, \SORT_NUMERIC);
        $locked = $db->createCommand(
            'SELECT [[id]] FROM '.FormRecord::TABLE.' WHERE [[id]] IN (:first, :second) AND [[dateTrashed]] IS NULL ORDER BY [[id]] FOR UPDATE',
            [':first' => $ids[0], ':second' => $ids[1]],
        )->queryColumn();
        if (2 !== \count($locked)) {
            throw new \DomainException(Freeform::t('One of the forms no longer exists.'));
        }
    }

    public function layoutFingerprint(Form $source, Form $target): string
    {
        return hash('sha256', serialize($this->layoutState($source, $target)));
    }

    public function backgroundPlan(Form $source, Form $target, array $input, array $textInput = []): array
    {
        $layout = $this->layoutFingerprint($source, $target);
        ['rows' => $rows, 'pages' => $pages] = $this->mapping($source, $target);
        $map = FieldMapping::validate($input, $rows, $pages);
        $from = $this->fields($source);
        $to = $this->fields($target);
        $additions = $this->additions($target, $from, $map);
        $optionMerges = $this->optionMerges($input, $map, $from, $to);
        $textRules = $this->textRules($textInput, $from, $to, $map);
        $problems = $this->primaryStorageProblems($target, $to, $map, $textRules);
        if ($problems) {
            throw new \DomainException($problems[0]);
        }
        $this->contentQuery($source, $from);

        $destinations = $changes = $labels = $columns = $arrays = $choices = [];
        foreach ($rows as $id => $row) {
            $columns[$id] = Submission::getFieldColumnName($from[$id]);
            if (FieldMapping::usesChoiceArray($from[$id])) {
                $arrays[$id] = true;
            }
            $labels[$id] = $row['label'];
            if (isset($additions[$id])) {
                $changes[] = ['source' => $row['label'], 'destination' => Freeform::t('Add as {handle} on {page}', [
                    'handle' => $additions[$id]['handle'], 'page' => $pages[$additions[$id]['pageId']],
                ])];
            } elseif (isset($map[$id])) {
                $targetField = $to[$map[$id]];
                $destinations[$id] = Submission::getFieldColumnName($targetField);
                $allowed = FieldMapping::choices($targetField, $optionMerges[$id] ?? []);
                if (null !== $allowed) {
                    $choices[$id] = ['values' => $allowed, 'multiple' => FieldMapping::usesChoiceArray($targetField)];
                }
                $changes[] = ['source' => $row['label'], 'destination' => $row['targets'][$map[$id]], 'options' => $optionMerges[$id] ?? []];
            }
        }
        if ($layout !== $this->layoutFingerprint($source, $target)) {
            throw new \DomainException(Freeform::t('The forms changed. Review the merge again.'));
        }

        return [
            'layout' => $layout,
            'input' => $input,
            'map' => $map,
            'destinations' => $destinations,
            'textRules' => $textRules,
            'hasAdditions' => (bool) $additions,
            'hasOptionMerges' => (bool) $optionMerges,
            'changes' => $changes,
            'labels' => $labels,
            'columns' => $columns,
            'arrays' => $arrays,
            'choices' => $choices,
            'sourceTable' => Submission::getContentTableName($source),
            'targetTable' => Submission::getContentTableName($target),
            'through' => (int) $this->submissionQuery($source)->max('s.id'),
        ];
    }

    public function reviewBackgroundBatch(Form $source, Form $target, array $plan, int $cursor): ?array
    {
        $batch = $this->backgroundRows($source, $plan, $cursor, $plan['through']);
        if (!$batch) {
            return null;
        }

        $omitted = $ids = $validators = [];
        $textRules = $plan['textRules'] ?? [];
        $textExamples = $plan['textExamples'] ?? [];
        $textInputs = array_fill_keys(TextRules::inputIds($textRules), true);
        foreach ($plan['choices'] as $id => $choices) {
            $validators[$id] = FieldMapping::choiceValidator($choices['values'], $choices['multiple']);
        }

        foreach ($batch as $record) {
            $ids[] = (int) $record['id'];
            if (null === $record['contentId']) {
                throw new \DomainException(Freeform::t('A submission on the original form is missing its stored content.'));
            }
            $bytes = 0;
            foreach ($plan['columns'] as $id => $column) {
                $value = isset($record['value_'.$id]) ? (string) $record['value_'.$id] : null;
                if (isset($plan['map'][$id])) {
                    $bytes += \strlen($value ?? '');
                    if (isset($validators[$id]) && !$validators[$id]($value)) {
                        throw new \DomainException(Freeform::t('A stored value for {field} is incompatible with the selected field in the receiving form. Stop this move and review a different mapping.', ['field' => $plan['labels'][$id]]));
                    }
                } elseif (!isset($textInputs[$id]) && FieldMapping::hasStoredValue($value, isset($plan['arrays'][$id]))) {
                    $omitted[$id] = ($omitted[$id] ?? 0) + 1;
                }
            }
            foreach ($textRules as $rule) {
                $bytes += array_sum(array_map('strlen', TextRules::apply($rule, $record)));
            }
            $textExamples = TextRules::examples($textRules, $record, $textExamples);
            if ($bytes > MergeLimits::MAX_WRITE_BYTES) {
                throw new \DomainException(Freeform::t('A submission has too much mapped data to move in one batch. Stop this move and review a smaller mapping.'));
            }
        }
        $this->requireTransferableSubmissions($source, $target, $ids);

        return [
            'throughId' => end($ids),
            'checksum' => $this->batchChecksum($batch),
            'count' => \count($ids),
            'omitted' => $omitted,
            'textExamples' => $textExamples,
        ];
    }

    /** Runs inside the checkpoint transaction. */
    public function moveBackgroundBatch(Form $source, Form $target, array $plan, int $cursor, int $through, string $checksum): array
    {
        $db = \Craft::$app->getDb();
        self::lockForms($db, [$source->getId(), $target->getId()]);
        if ($plan['layout'] !== $this->layoutFingerprint($source, $target)) {
            throw new \DomainException(Freeform::t('A form changed after this review started. Stop the job and review the remaining submissions again.'));
        }

        $this->lockSubmissions($db, $source, $cursor, $through, $plan['sourceTable']);
        $batch = $this->backgroundRows($source, $plan, $cursor, $through);
        if (!$batch || !hash_equals($checksum, $this->batchChecksum($batch))) {
            throw new \DomainException(Freeform::t('A reviewed submission changed. Stop this move and review the remaining submissions again.'));
        }
        $this->requireTransferableSubmissions($source, $target, array_column($batch, 'id'));

        return $this->writeContentBatch($db, $source, $target, $plan['targetTable'], $plan['destinations'], $batch, $plan['sourceTable'], $plan['textRules'] ?? []);
    }

    public function refreshMovedSubmissions(array $submissionIds): bool
    {
        try {
            $elements = \Craft::$app->getElements();
            $elements->invalidateCachesForElementType(Submission::class);
            $elements->invalidateCachesForElementType(SpamSubmission::class);

            if (!Freeform::getInstance()->settings->isUpdateSearchIndexes()) {
                return true;
            }

            foreach ($submissionIds as $type => $ids) {
                foreach (array_chunk($ids, self::SEARCH_BATCH_SIZE) as $batch) {
                    if (null === Queue::push(new UpdateSearchIndex(['elementType' => $type, 'elementId' => $batch]))) {
                        throw new \RuntimeException('The queue did not accept the search index job.');
                    }
                }
            }
        } catch (\Throwable $exception) {
            // Search indexing can be retried independently of the committed merge.
            \Craft::error((string) $exception, __METHOD__);

            return false;
        }

        return true;
    }

    public function canPreviewSubmissions(Form $source, Form $target, array $ids): bool
    {
        return !$ids || !$this->hasUnavailableSubmissionSites($source, $target, $ids);
    }

    private function backgroundRows(Form $source, array $plan, int $cursor, int $through): array
    {
        return $this->contentQuery($source, $plan['columns'], $plan['sourceTable'])->addSelect('s.isSpam')
            ->andWhere(['>', 's.id', $cursor])
            ->andWhere(['<=', 's.id', $through])
            ->limit(MergeLimits::batchSize(\count($plan['columns'])))
            ->all()
        ;
    }

    private function batchChecksum(array $batch): string
    {
        $hash = hash_init('sha256');
        foreach ($batch as $record) {
            $record['isSpam'] = (int) BooleanHelper::normalize($record['isSpam']);
            hash_update($hash, serialize(array_map(static fn ($value) => null === $value ? null : (string) $value, $record)));
        }

        return hash_final($hash);
    }

    private function requireTransferableSubmissions(Form $source, Form $target, array $ids): void
    {
        if ($this->hasUnavailableSubmissionSites($source, $target, $ids)) {
            throw new \DomainException(Freeform::t('Some submissions belong to sites that the receiving form does not support or that you cannot edit.'));
        }
        if (\Craft::$app->getDb()->tableExists(PaymentRecord::TABLE)
            && $this->submissionQuery($source)->innerJoin(['p' => PaymentRecord::TABLE], '[[p.submissionId]] = [[s.id]]')
                ->andWhere(['s.id' => $ids])->exists()) {
            throw new \DomainException(Freeform::t('This form has submissions with payment records. Merge fields only.'));
        }
    }

    private function alterColumns(Connection $db, string $table, array $columns, bool $add): void
    {
        $type = $db->getQueryBuilder()->getColumnType('text');
        $operations = [];
        foreach ($columns as $column) {
            $quoted = $db->quoteColumnName($column);
            $operations[] = $add ? "ADD COLUMN {$quoted} {$type}" : "DROP COLUMN {$quoted}";
        }

        $db->createCommand('ALTER TABLE '.$db->quoteTableName($table).' '.implode(', ', $operations))->execute();
    }

    private function requireReview(Form $source, Form $target, array $input, bool $move, bool $delete, string $token, array $textInput): array
    {
        $review = $this->review($source, $target, $input, $move, $delete, $textInput);
        if ($review['problems']) {
            throw new \DomainException($review['problems'][0]);
        }
        if (!hash_equals($review['token'], $token)) {
            throw new \DomainException(Freeform::t('The forms or submissions changed. Review the merge again.'));
        }

        return $review;
    }

    private function lockSubmissions(Connection $db, Form $source, ?int $after = null, ?int $through = null, ?string $table = null): void
    {
        $table ??= Submission::getContentTableName($source);
        if (!$db->getTableSchema($table, true)) {
            throw new \DomainException($this->missingContentTableMessage($source));
        }

        $submissions = $this->submissionQuery($source)->select(['s.id'])->orderBy('s.id');
        $content = $this->submissionQuery($source)->select(['c.id'])
            ->innerJoin(['c' => $table], '[[c.id]] = [[s.id]]')
            ->orderBy('c.id')
        ;

        foreach ([$submissions, $content] as $query) {
            if (null !== $after && null !== $through) {
                $query->andWhere(['>', 's.id', $after])->andWhere(['<=', 's.id', $through]);
            }
            $command = $query->createCommand($db);
            $db->createCommand($command->getSql().' FOR UPDATE', $command->params)->execute();
        }
    }

    private function fields(Form $form): array
    {
        $fields = [];
        foreach ($form->getLayout()->getFields() as $field) {
            if ($field->getId() && !$field instanceof NoStorageInterface) {
                $fields[$field->getId()] = $field;
            }
        }

        return $fields;
    }

    private function layoutState(Form $source, Form $target): array
    {
        $ids = [$source->getId(), $target->getId()];
        $state = [$ids];
        foreach ([FormRecord::TABLE, FormPageRecord::TABLE, FormRowRecord::TABLE, FormFieldRecord::TABLE, FormSiteRecord::TABLE] as $table) {
            $condition = [FormRecord::TABLE === $table ? 'id' : 'formId' => $ids];
            $state[] = (new Query())->from($table)->where($condition)->orderBy('id')->all();
        }

        return $state;
    }

    private function optionMerges(array $input, array $map, array $sourceFields, array $targetFields): array
    {
        $merges = [];
        foreach ($map as $id => $destination) {
            if (str_starts_with($input[$id], 'options:')) {
                $merges[$id] = FieldMapping::optionAdditions($sourceFields[$id], $targetFields[$destination]);
            }
        }

        return $merges;
    }

    private function appendFieldOptions(Connection $db, int $formId, int $fieldId, array $options): void
    {
        $condition = ['id' => $fieldId, 'formId' => $formId];
        $record = FormFieldRecord::findOne($condition);
        if (!$record) {
            throw new \DomainException(Freeform::t('A field on the receiving form changed. Review the merge again.'));
        }
        $metadata = json_decode($record->metadata, true, flags: \JSON_THROW_ON_ERROR);
        $configuration = $metadata['optionConfiguration'] ?? [];
        $metadata['optionConfiguration'] = FieldMapping::appendOptions(\is_array($configuration) ? $configuration : [], $options);
        $db->createCommand()->update(FormFieldRecord::TABLE, [
            'metadata' => json_encode($metadata, \JSON_THROW_ON_ERROR),
            'dateUpdated' => gmdate('Y-m-d H:i:s'),
        ], $condition)->execute();
    }

    private function additions(Form $target, array $sourceFields, array $map): array
    {
        $newFields = array_filter($map, static fn (string $destination) => str_starts_with($destination, 'add:'));
        if (!$newFields) {
            return [];
        }
        if (\count($newFields) > MergeLimits::MAX_NEW_FIELDS) {
            throw new \DomainException(Freeform::t('Add up to {limit, number} new fields per merge. Choose fewer fields and review again.', ['limit' => MergeLimits::MAX_NEW_FIELDS]));
        }

        $sourceRecords = FormFieldRecord::find()->where(['id' => array_keys($newFields)])->indexBy('id')->all();
        $handles = [];
        foreach ($target->getLayout()->getFields() as $field) {
            $handles[strtolower((string) $field->getHandle())] = true;
        }

        $additions = [];
        foreach ($newFields as $id => $destination) {
            $sourceRecord = $sourceRecords[$id] ?? null;
            if (!$sourceRecord) {
                throw new \DomainException(Freeform::t('A field on the original form changed. Review the merge again.'));
            }

            $field = $sourceFields[$id];
            $handle = $field->getHandle();
            for ($suffix = 2; isset($handles[strtolower($handle)]); ++$suffix) {
                $handle = $field->getHandle().$suffix;
            }
            $handles[strtolower($handle)] = true;

            $metadata = json_decode($sourceRecord->metadata, true, flags: \JSON_THROW_ON_ERROR);
            $metadata['handle'] = $handle;
            $metadata['required'] = false;
            // A copied email field should not acquire a new notification link or sender role.
            unset($metadata['recipients'], $metadata['notificationId']);

            $additions[$id] = [
                'handle' => $handle,
                'pageId' => (int) substr($destination, 4),
                'record' => [
                    'formId' => $target->getId(),
                    'type' => $sourceRecord->type,
                    'metadata' => json_encode($metadata, \JSON_THROW_ON_ERROR),
                    'order' => 0,
                    'uid' => StringHelper::UUID(),
                ],
            ];
        }

        return $additions;
    }

    private function insertField(array $record): int
    {
        $field = new FormFieldRecord();
        $field->setAttributes($record, false);
        if (!$field->save(false)) {
            throw new \RuntimeException('Could not save a merged field.');
        }

        return (int) $field->id;
    }

    private function appendRow(Connection $db, Form $target, int $pageId): int
    {
        $page = FormPageRecord::findOne(['id' => $pageId, 'formId' => $target->getId()]);
        if (!$page) {
            throw new \DomainException(Freeform::t('The selected page in the receiving form no longer exists.'));
        }

        $row = new FormRowRecord();
        $row->formId = $target->getId();
        $row->layoutId = $page->layoutId;
        $row->order = 1 + (int) (new Query())->from(FormRowRecord::TABLE)->where(['layoutId' => $page->layoutId])->max('[[order]]', $db);
        if (!$row->save()) {
            throw new \RuntimeException('Could not add the merged field to the primary layout.');
        }

        return (int) $row->id;
    }

    private function submissionQuery(Form $source): Query
    {
        return (new Query())->from(['s' => Submission::TABLE])->where(['s.formId' => $source->getId()]);
    }

    private function hasUnavailableSubmissionSites(Form $source, Form $target, ?array $ids = null): bool
    {
        if (!SitesHelper::isEnabled()) {
            return false;
        }

        $formSites = (new Query())->select('siteId')->from(FormSiteRecord::TABLE);
        $sourceSites = (clone $formSites)->where(['formId' => $source->getId()])->column();
        $targetSites = $formSites->where(['formId' => $target->getId()])->column();
        if (!PermissionHelper::isAdmin() && \Craft::$app->getIsMultiSite()) {
            // Queue workers may process multiple users. Resolve site access for the current actor.
            $editorSites = [];
            foreach (\Craft::$app->getSites()->getAllSites(true) as $site) {
                if (PermissionHelper::checkPermission('editSite:'.$site->uid)) {
                    $editorSites[] = $site->id;
                }
            }
            $targetSites = array_intersect($targetSites, $editorSites);
        }

        // Craft can propagate a submission to sites where its Freeform form is unavailable.
        $query = $this->submissionQuery($source)
            ->innerJoin(['es' => Table::ELEMENTS_SITES], '[[es.elementId]] = [[s.id]]')
        ;
        if ($sourceSites) {
            $query->andWhere(['es.siteId' => $sourceSites]);
        }
        if (null !== $ids) {
            $query->andWhere(['s.id' => $ids]);
        }

        return $query
            ->andWhere(['not', ['es.siteId' => $targetSites]])
            ->exists()
        ;
    }

    private function textRules(array $input, array $from, array $to, array $map): array
    {
        $rules = TextRules::validate($input, $from, $to, $map);
        foreach ($rules as &$rule) {
            $rule['outputColumns'] = array_map(static fn (int $id) => Submission::getFieldColumnName($to[$id]), $rule['outputs']);
            $rule['inputLabels'] = array_map(static fn (int $id) => $from[$id]->getLabel() ?: $from[$id]->getHandle(), $rule['inputs']);
            $rule['outputLabels'] = array_map(static fn (int $id) => $to[$id]->getLabel() ?: $to[$id]->getHandle(), $rule['outputs']);
        }

        return $rules;
    }

    private function primaryStorageProblems(Form $target, array $targetFields, array $map, array $textRules = []): array
    {
        $schema = \Craft::$app->getDb()->getTableSchema(Submission::getContentTableName($target), true);
        if (!$schema) {
            return [$this->missingContentTableMessage($target)];
        }

        $problems = [];
        $ruleTargets = $textRules ? array_merge(...array_column($textRules, 'outputs')) : [];
        foreach ([...array_values($map), ...$ruleTargets] as $targetId) {
            $field = $targetFields[$targetId] ?? null;
            if ($field && !isset($schema->columns[Submission::getFieldColumnName($field)])) {
                $problems[] = Freeform::t('The storage column for {field} in the receiving form is missing. Check that form’s submission storage before merging.', [
                    'field' => $field->getHandle(),
                ]);
            }
        }

        return $problems;
    }

    private function missingContentTableMessage(Form $form): string
    {
        return Freeform::t('The submission table for {form} was not found. Follow Freeform’s upgrade instructions. If the table uses an older name, run php craft freeform/submissions/fix-table-names before merging.', [
            'form' => $form->getName(),
        ]);
    }

    private function contentQuery(Form $source, array $fields, ?string $table = null): Query
    {
        $table ??= Submission::getContentTableName($source);
        $schema = \Craft::$app->getDb()->getTableSchema($table, true);
        if (!$schema) {
            throw new \DomainException($this->missingContentTableMessage($source));
        }

        $select = ['id' => 's.id', 'contentId' => 'c.id'];
        foreach ($fields as $id => $field) {
            $column = \is_string($field) ? $field : Submission::getFieldColumnName($field);
            if (!isset($schema->columns[$column])) {
                throw new \DomainException(Freeform::t('A field storage column is missing on the original form. Check its layout before merging.'));
            }
            $select['value_'.$id] = 'c.'.$column;
        }

        return $this->submissionQuery($source)->select($select)
            ->leftJoin(['c' => $table], '[[c.id]] = [[s.id]]')->orderBy('s.id')
        ;
    }

    private function requireSubmissionLimit(Form $source, int $fields): int
    {
        $limit = MergeLimits::submissionLimit($fields);
        $extraSubmission = $this->submissionQuery($source)->select('s.id')->offset($limit)->limit(1)->exists();
        if ($extraSubmission) {
            throw new MergeSizeException($this->submissionLimitMessage($limit));
        }

        return $limit;
    }

    private function submissionLimitMessage(int $limit): string
    {
        return Freeform::t('This form exceeds the limit of {limit, number} submissions for its field count. Turn off submission moving to merge fields only.', ['limit' => $limit]);
    }

    private function contentBatches(Query $query, int $fields): \Generator
    {
        $limit = MergeLimits::batchSize($fields);
        $afterId = 0;
        do {
            // A SQL LIMIT bounds what PDO can buffer, and IDs stay stable while moved rows leave the source.
            $batch = (clone $query)->andWhere(['>', 's.id', $afterId])->limit($limit)->all();
            if (!$batch) {
                return;
            }
            $afterId = (int) end($batch)['id'];

            yield $batch;
        } while (\count($batch) === $limit);
    }

    private function scan(Form $source, array $from, array $to, array $map, array $textRules, array $optionMerges): array
    {
        $limit = $this->requireSubmissionLimit($source, \count($from));
        $db = \Craft::$app->getDb();
        $stats = ['count' => 0, 'omitted' => [], 'invalid' => [], 'payments' => false, 'textExamples' => []];
        $textInputs = array_fill_keys(TextRules::inputIds($textRules), true);
        if ($db->tableExists(PaymentRecord::TABLE)) {
            $stats['payments'] = $this->submissionQuery($source)
                ->innerJoin(['p' => PaymentRecord::TABLE], '[[p.submissionId]] = [[s.id]]')->exists()
            ;
        }

        $validators = [];
        foreach ($map as $id => $destination) {
            if (isset($to[$destination])) {
                $validators[$id] = FieldMapping::storedValueValidator($to[$destination], $optionMerges[$id] ?? []);
            }
        }

        $bytes = 0;
        foreach ($this->contentBatches($this->contentQuery($source, $from), \count($from)) as $batch) {
            foreach ($batch as $record) {
                if (null === $record['contentId']) {
                    throw new \DomainException(Freeform::t('A submission on the original form is missing its stored content. The submissions could not be reviewed.'));
                }
                if (++$stats['count'] > $limit) {
                    throw new MergeSizeException($this->submissionLimitMessage($limit));
                }

                $rowBytes = 0;
                foreach ($from as $id => $field) {
                    $value = isset($record['value_'.$id]) ? (string) $record['value_'.$id] : null;
                    $rowBytes += \strlen($value ?? '');
                    if (!isset($map[$id]) && !isset($textInputs[$id]) && FieldMapping::populated($field, $value)) {
                        $stats['omitted'][$id] = ($stats['omitted'][$id] ?? 0) + 1;
                    }
                    if (isset($validators[$id]) && !$validators[$id]($value)) {
                        $stats['invalid'][$id] = ($stats['invalid'][$id] ?? 0) + 1;
                    }
                }
                foreach ($textRules as $rule) {
                    $rowBytes += array_sum(array_map('strlen', TextRules::apply($rule, $record)));
                }
                $stats['textExamples'] = TextRules::examples($textRules, $record, $stats['textExamples']);
                $bytes += $rowBytes;
                if ($bytes > MergeLimits::MAX_VALUE_BYTES || $rowBytes > MergeLimits::MAX_WRITE_BYTES) {
                    throw new MergeSizeException(Freeform::t('The original form has too much stored field data to move in one request. Turn off submission moving to merge fields only.'));
                }
            }
        }

        return $stats;
    }

    private function moveSubmissions(Connection $db, Form $source, Form $target, string $targetTable, array $from, array $destinations, int $expected, array $textRules): array
    {
        $inputs = $destinations + array_fill_keys(TextRules::inputIds($textRules), true);
        $query = $this->contentQuery($source, array_intersect_key($from, $inputs))->addSelect('s.isSpam');
        $submissionIds = [];
        foreach ($this->contentBatches($query, \count($inputs)) as $batch) {
            foreach ($this->writeContentBatch($db, $source, $target, $targetTable, $destinations, $batch, textRules: $textRules) as $type => $ids) {
                foreach ($ids as $id) {
                    $submissionIds[$type][] = $id;
                }
            }
        }
        if ($this->countMoved($submissionIds) !== $expected) {
            throw new \RuntimeException('The number of moved submissions did not match the review.');
        }

        return $submissionIds;
    }

    private function writeContentBatch(Connection $db, Form $source, Form $target, string $targetTable, array $destinations, array $batch, ?string $sourceTable = null, array $textRules = []): array
    {
        $sourceTable ??= Submission::getContentTableName($source);
        $columns = ['id', ...array_values($destinations)];
        foreach ($textRules as $rule) {
            array_push($columns, ...$rule['outputColumns']);
        }
        $submissionIds = $rows = $ids = [];
        $batchBytes = 0;
        foreach ($batch as $record) {
            $row = [$record['id']];
            $rowBytes = 0;
            foreach ($destinations as $sourceId => $column) {
                $value = $record['value_'.$sourceId];
                $row[] = $value;
                $rowBytes += \strlen((string) $value);
            }
            foreach ($textRules as $rule) {
                $values = TextRules::apply($rule, $record);
                array_push($row, ...$values);
                $rowBytes += array_sum(array_map('strlen', $values));
            }
            if ($ids && $batchBytes + $rowBytes > MergeLimits::MAX_WRITE_BYTES) {
                $this->moveBatch($db, $source, $target, $sourceTable, $targetTable, $columns, $rows, $ids);
                $rows = $ids = [];
                $batchBytes = 0;
            }

            $type = BooleanHelper::normalize($record['isSpam']) ? SpamSubmission::class : Submission::class;
            $submissionIds[$type][] = (int) $record['id'];
            $ids[] = $record['id'];
            $rows[] = $row;
            $batchBytes += $rowBytes;
        }

        if ($ids) {
            $this->moveBatch($db, $source, $target, $sourceTable, $targetTable, $columns, $rows, $ids);
        }

        return $submissionIds;
    }

    private function moveBatch(Connection $db, Form $source, Form $target, string $sourceTable, string $targetTable, array $columns, array $rows, array $ids): void
    {
        $db->createCommand()->batchInsert($targetTable, $columns, $rows)->execute();
        $count = $db->createCommand()->update(Submission::TABLE, ['formId' => $target->getId()], [
            'id' => $ids,
            'formId' => $source->getId(),
        ], updateTimestamp: false)->execute();
        $removed = $db->createCommand()->delete($sourceTable, ['id' => $ids])->execute();
        if (\count($ids) !== $count || $removed !== $count) {
            throw new \RuntimeException('The source submission rows changed during the merge.');
        }

        // Old keywords may contain values the user chose to omit from the transfer.
        $db->createCommand()->delete(Table::SEARCHINDEX, ['elementId' => $ids])->execute();
    }

    private function countMoved(array $submissionIds): int
    {
        return array_sum(array_map('count', $submissionIds));
    }
}
