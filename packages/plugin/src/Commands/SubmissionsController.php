<?php

namespace Solspace\Freeform\Commands;

use craft\console\Controller;
use craft\db\Query;
use craft\helpers\Queue;
use craft\queue\jobs\ResaveElements;
use Faker\Factory;
use Solspace\Freeform\Bundles\Form\Submissions\FakeDataProvider;
use Solspace\Freeform\Commands\Fix\TitleFixMigration;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Fields\Implementations\Pro\SignatureField;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Records\Form\FormSiteRecord;
use yii\console\ExitCode;
use yii\helpers\Console;

class SubmissionsController extends Controller
{
    /** @var bool whether to update the search indexes for the resaved elements */
    public bool $updateSearchIndex = false;

    /** @var null|int|string the ID(s) of the elements to resave */
    public int|string|null $elementId = null;

    /** @var null|string the UUID(s) of the elements to resave */
    public ?string $uid = null;

    /** @var int|string The status(es) of elements to resave. Can be set to multiple comma-separated statuses. */
    public int|string|null $status = null;

    /** @var bool whether the elements should be resaved via a queue job */
    public bool $queue = false;

    /** @var null|int the number of elements to skip */
    public ?int $offset = null;

    /** @var null|int the number of elements to resave */
    public ?int $limit = null;

    public ?string $locale = Factory::DEFAULT_LOCALE;

    /** @var null|int The amount of submissions to generate */
    public ?int $count = 1;

    /** @var null|int|string The form handle or ID to generate submissions for */
    public int|string|null $form = null;

    public ?int $authorId = null;

    /** @var bool Mark generated submissions as spam */
    public bool $spam = false;

    /** @var null|string Start dates from this date (Can use relative wording.) */
    public ?string $rangeStart = null;

    /** @var null|string End dates with this date (Can use relative wording.) */
    public ?string $rangeEnd = null;

    /** @var null|array|int Site ID's to resave for */
    public array|int|null $siteId = null;

    public ?bool $verbose = false;
    public ?bool $dryRun = false;

    public ?int $batch = 200;
    public ?int $afterId = null;

    public function optionAliases(): array
    {
        return [
            'l' => 'locale',
            'c' => 'count',
            'f' => 'form',
            'a' => 'authorId',
            's' => 'status',
            'rs' => 'rangeStart',
            're' => 'rangeEnd',
            'v' => 'verbose',
        ];
    }

    public function options($actionID): array
    {
        return match ($actionID) {
            'fix-titles' => [],
            'generate' => [
                'locale',
                'count',
                'form',
                'spam',
                'authorId',
                'status',
                'rangeStart',
                'rangeEnd',
                'verbose',
                'dryRun',
            ],
            'resave' => [
                'updateSearchIndex',
                'elementId',
                'uid',
                'status',
                'queue',
                'offset',
                'limit',
                'siteId',
                'batch',
                'afterId',
                'verbose',
                'dryRun',
            ],
            'reindex' => [
                'limit',
                'siteId',
                'dryRun',
            ],
        };
    }

    public function actionGenerate(): int
    {
        $this->stdout("===================================\n", Console::FG_YELLOW);
        $this->stdout("= Generating Freeform Submissions =\n", Console::FG_YELLOW);
        $this->stdout("===================================\n\n", Console::FG_YELLOW);

        $fakeDataProvider = \Craft::$container->get(FakeDataProvider::class);
        $faker = $fakeDataProvider->getFaker($this->locale);
        $freeform = Freeform::getInstance();
        $verbose = $this->verbose || $this->dryRun;

        $name = 1 === $this->count ? Submission::lowerDisplayName() : Submission::pluralLowerDisplayName();
        $this->stdout("Generating {$this->count} {$name} for form \"{$this->form}\"...\n\n", Console::FG_YELLOW);

        $form = $freeform->forms->getFormByHandleOrId($this->form);
        if (!$form) {
            throw new \Exception('No form found. Please specify a valid form handle or ID.');
        }

        $defaultStatus = $form->getSettings()->getGeneral()->defaultStatus;
        $allStatuses = $freeform->statuses->getAllStatuses();

        if ('any' === $this->status) {
            $statuses = array_keys($allStatuses);
        } elseif (is_numeric($this->status)) {
            $statuses = [$this->status];
        } else {
            $statuses = explode(',', $this->status);
            $statuses = array_map(
                static function ($status) use ($allStatuses) {
                    if (is_numeric($status)) {
                        return $allStatuses[$status]?->id;
                    }

                    foreach ($allStatuses as $statusModel) {
                        if ($statusModel->handle === $status) {
                            return $statusModel->id;
                        }
                    }

                    return null;
                },
                $statuses,
            );
            $statuses = array_filter($statuses);
        }

        if (empty($statuses)) {
            $statuses = [$defaultStatus];
        }

        if ($this->dryRun) {
            $this->stdout("Dry run enabled. No submissions will be saved.\n\n", Console::FG_YELLOW);
        }

        if (!$verbose) {
            Console::startProgress(0, $this->count, '', 0.44);
        }

        for ($i = 0; $i < $this->count; ++$i) {
            $values = $fakeDataProvider->generate($form, $this->locale);

            $dateCreated = new \DateTime();
            if ($this->rangeStart || $this->rangeEnd) {
                $dateCreated = $faker->dateTimeBetween(
                    $this->rangeStart ?? '-1 year',
                    $this->rangeEnd ?? 'now'
                );
            }

            $submission = Submission::create($form);
            $submission->userId = $this->authorId;
            $submission->isSpam = $this->spam;
            $submission->statusId = $faker->randomElement($statuses);
            $submission->dateCreated = $dateCreated;
            $submission->dateUpdated = $dateCreated;
            $submission->title = Submission::generateTitle($submission, $form);
            $submission->setFormFieldValues($values);

            if (!$this->dryRun) {
                \Craft::$app->elements->saveElement($submission, false, false, true);
            }

            if (!$verbose) {
                Console::updateProgress($i + 1, $this->count);
            }

            if ($verbose) {
                $signatureFields = $form->getLayout()->getFields(SignatureField::class);
                foreach ($signatureFields as $field) {
                    $values[$field->getHandle()] = '**** redacted ****';
                }

                if (!$this->dryRun) {
                    $this->stdout("Submission #{$submission->id} created\n");
                } else {
                    $number = $i + 1;
                    $this->stdout("Generated Submission #{$number} preview\n");
                }

                $this->stdout("Date Created: {$submission->dateCreated->format('Y-m-d H:i:s')}\n");
                $this->stdout("Status: {$submission->getStatus()}\n");

                $this->stdout(json_encode($values, \JSON_PRETTY_PRINT)."\n\n");
            }
        }

        if (!$verbose) {
            Console::endProgress(true);
        }

        $this->stdout("\n\n--- done ---\n", Console::FG_YELLOW);

        return ExitCode::OK;
    }

    public function actionFixTitles(): int
    {
        $this->stdout('Fixing submission titles...'.\PHP_EOL, Console::FG_YELLOW);

        $migration = new TitleFixMigration();
        $migration->run();

        $this->stdout('Submission titles fixed.'.\PHP_EOL, Console::FG_YELLOW);

        return ExitCode::OK;
    }

    /**
     * Removes old submissions based on the specified age parameter.
     */
    public function actionResave(): int
    {
        if ($this->dryRun) {
            $this->stdout("Dry run enabled. No submissions will be resaved.\n\n", Console::FG_YELLOW);
        }

        $elementType = Submission::class;
        $criteria = $this->collectCriteria();

        /*
         * If siteId provided, translate it to:
         * - formId(s) enabled for that site (so we only touch submissions for forms on that site)
         * - formSiteId(s) so SubmissionQuery can join forms_sites and enforce site assignment
         *
         * IMPORTANT: unset element siteId so we don't apply Craft element localization filtering.
         */
        if (null !== $this->siteId) {
            $siteIds = \is_array($this->siteId)
                ? array_map('intval', $this->siteId)
                : [(int) $this->siteId];

            $formIdsForSites = $this->getFormIdsForSiteIds($siteIds);

            if (empty($formIdsForSites)) {
                $this->stdout(
                    'No Freeform forms are enabled for siteId(s): '.implode(',', $siteIds).\PHP_EOL,
                    Console::FG_YELLOW
                );

                return ExitCode::OK;
            }

            // Filter submissions to only those forms (and enforce forms_sites)
            $criteria['formId'] = $formIdsForSites;
            $criteria['formSiteId'] = $siteIds;

            // DO NOT localize submissions query by element siteId
            unset($criteria['siteId']);
        }

        if ($this->verbose) {
            $this->stdout('Criteria: '.json_encode($criteria).\PHP_EOL, Console::FG_YELLOW);
        }

        // Base query (we'll use this to fetch IDs in chunks)
        $baseQuery = $elementType::find();
        \Craft::configure($baseQuery, $criteria);

        $afterId = (int) ($this->afterId ?? 0);
        if ($afterId > 0) {
            $baseQuery->andWhere(['>', 'elements.id', $afterId]);
        }

        $batchSize = (int) ($this->batch ?? 200);
        if ($batchSize < 1) {
            $batchSize = 200;
        }

        $total = (int) $baseQuery->count();

        $elementsText = 1 === $total ? $elementType::lowerDisplayName() : $elementType::pluralLowerDisplayName();

        if (!$this->dryRun) {
            $this->stdout("Resaving {$total} {$elementsText} ...\n", Console::FG_YELLOW);
        }

        $processed = 0;
        $lastId = $afterId;

        while (true) {
            $idQuery = clone $baseQuery;

            $ids = $idQuery
                ->select(['elements.id'])
                ->orderBy(['elements.id' => \SORT_ASC])
                ->limit($batchSize)
                ->column()
            ;

            if (!$ids) {
                break;
            }

            $lastId = (int) end($ids);
            $chunkCount = \count($ids);

            $baseQuery->andWhere(['>', 'elements.id', $lastId]);

            if ($this->queue) {
                if ($this->dryRun) {
                    $processed += $chunkCount;

                    if ($this->verbose) {
                        $this->stdout("Queued {$chunkCount} (Queued {$processed}/{$total})\n");
                    }

                    continue;
                }

                // Enqueue ONE job per chunk, with tight criteria
                $jobCriteria = $criteria;
                $jobCriteria['id'] = $ids;

                // Ensure no accidental offset/limit carry through into chunk jobs
                unset($jobCriteria['offset'], $jobCriteria['limit']);

                Queue::push(
                    new ResaveElements([
                        'elementType' => $elementType,
                        'criteria' => $jobCriteria,
                        'updateSearchIndex' => $this->updateSearchIndex,
                    ]),
                    Freeform::getInstance()->settings->getQueuePriority()
                );

                $processed += $chunkCount;

                if ($this->verbose) {
                    $this->stdout("Queued {$chunkCount} (Queued {$processed}/{$total})\n");
                }

                continue;
            }

            // Non-queue: resave this chunk immediately
            $chunkQuery = $elementType::find()->id($ids);

            // Keep localization off unless we explicitly want it (If we ever do want localization, pass a real siteId into $chunkQuery)
            $chunkQuery->siteId(null);

            \Craft::$app->elements->resaveElements(
                $chunkQuery,
                true,
                true,
                $this->updateSearchIndex
            );

            $processed += $chunkCount;

            if ($this->verbose) {
                $this->stdout("Resaved {$chunkCount} submissions. (Processed {$processed}/{$total})\n");
            }
        }

        if ($this->queue) {
            $this->stdout("Done queueing {$processed} {$elementsText}.\n", Console::FG_YELLOW);
        } else {
            $this->stdout("Done resaving {$processed} {$elementsText}.\n", Console::FG_YELLOW);
        }

        return ExitCode::OK;
    }

    /**
     * Re-indexes submissions.
     */
    public function actionReindex(): int
    {
        if ($this->limit) {
            $limit = $this->limit;
        } else {
            $limit = 200;
        }

        if ($this->siteId) {
            if (\is_array($this->siteId)) {
                $siteIds = array_map('intval', $this->siteId);
            } else {
                $siteIds = (int) $this->siteId;
            }
        } else {
            $siteIds = \Craft::$app->sites->getAllSiteIds();
        }

        $query = Submission::find()
            ->trashed(null)
            ->siteId($siteIds)
        ;

        $total = $query->count();

        $this->stdout("Reindexing {$total} Freeform submissions...\n");

        if ($this->dryRun) {
            $this->stdout("Dry run enabled. No submissions will be saved.\n\n", Console::FG_YELLOW);
        } else {
            foreach ($query->batch($limit) as $submissions) {
                foreach ($submissions as $submission) {
                    \Craft::$app->elements->saveElement($submission, false, false, true);
                }
            }
        }

        $this->stdout("Done.\n");

        return ExitCode::OK;
    }

    private function collectCriteria(): array
    {
        $criteria = [];

        if ($this->elementId) {
            $criteria['id'] = \is_int($this->elementId) ? $this->elementId : explode(',', $this->elementId);
        }

        if ($this->uid) {
            $criteria['uid'] = explode(',', $this->uid);
        }

        if ('any' === $this->status || null === $this->status) {
            $criteria['status'] = null;
        } elseif ($this->status) {
            $criteria['status'] = explode(',', $this->status);
        }

        if (isset($this->offset)) {
            $criteria['offset'] = $this->offset;
        }

        if (isset($this->limit)) {
            $criteria['limit'] = $this->limit;
        }

        if ($this->siteId) {
            if (\is_array($this->siteId)) {
                $this->siteId = array_map('intval', $this->siteId);
            } else {
                $this->siteId = (int) $this->siteId;
            }

            $criteria['siteId'] = $this->siteId;
        }

        return $criteria;
    }

    private function getFormIdsForSiteIds(array $siteIds): array
    {
        $ids = (new Query())
            ->select(['formId'])
            ->from(FormSiteRecord::TABLE)
            ->where(['siteId' => $siteIds])
            ->column()
        ;

        return array_values(array_unique(array_map('intval', $ids)));
    }
}
