<?php

namespace Solspace\Freeform\controllers;

use craft\db\Query;
use craft\helpers\StringHelper;
use Solspace\Freeform\Bundles\ABTesting\Providers\ABTestWinnerResolver;
use Solspace\Freeform\Library\Exceptions\Api\ApiException;
use Solspace\Freeform\Library\Exceptions\Api\ErrorCollection;
use Solspace\Freeform\Records\AbTests\AbTestRecord;
use Solspace\Freeform\Records\AbTests\AbTestStatisticsRecord;
use Solspace\Freeform\Records\AbTests\AbTestVariantRecord;
use Solspace\Freeform\Records\FormRecord;
use yii\web\NotFoundHttpException;
use yii\web\Response;

class AbTestsController extends BaseController
{
    private const DASHBOARD_DAYS = 21;

    public function actionGetOne(int $id): Response
    {
        $test = AbTestRecord::find()
            ->with('variants')
            ->where(['id' => $id])
            ->one()
        ;

        if (!$test) {
            throw new NotFoundHttpException('A/B Test group not found');
        }

        return $this->asJson($this->serializeTest($test));
    }

    public function actionStatistics(): Response
    {
        $statistics = [];

        $data = (new Query())
            ->select(['abVariantId', 'status', 'COUNT(*) as count'])
            ->from(AbTestStatisticsRecord::TABLE)
            ->groupBy(['abVariantId', 'status'])
            ->all()
        ;

        foreach ($data as $row) {
            $variantId = $row['abVariantId'];
            $count = $row['count'];
            $status = $row['status'];

            if (!isset($statistics[$variantId])) {
                $statistics[$variantId] = [
                    'completed' => 0,
                    'interacted' => 0,
                    'failed' => 0,
                    'served' => 0,
                ];
            }

            $statistics[$variantId][$status] = $count;
        }

        foreach ($statistics as $variantId => $variant) {
            $statistics[$variantId]['served']
                = $variant['served']
                + $variant['completed']
                + $variant['interacted']
                + $variant['failed'];

            $statistics[$variantId]['interacted']
                = $variant['interacted']
                + $variant['completed']
                + $variant['failed'];
        }

        return $this->asJson($statistics);
    }

    public function actionPost(?int $id = null): Response
    {
        $this->requirePostRequest();
        $post = $this->request->post();

        if ($id) {
            $record = AbTestRecord::findOne(['id' => $id]);
            if (!$record) {
                throw new NotFoundHttpException('A/B Test group not found');
            }
        } else {
            $record = new AbTestRecord();
        }

        $errorCollection = new ErrorCollection();

        $record->name = $post['name'] ?? '';
        $record->handle = $post['handle'] ?? StringHelper::toHandle($record->name);
        $record->description = $post['description'] ?? '';
        $record->startDate = $this->normalizeDate($post['startDate'] ?? null);
        $record->endDate = $this->normalizeDate($post['endDate'] ?? null);
        $record->save();

        $usedIds = [];
        $variants = $post['variants'] ?? [];
        foreach ($variants as $variant) {
            $formId = $variant['formId'] ?? null;
            if (!$formId) {
                continue;
            }

            $variantRecord = AbTestVariantRecord::findOne(['abTestId' => $record->id, 'id' => $variant['id']]);
            if (!$variantRecord) {
                $variantRecord = new AbTestVariantRecord(['abTestId' => $record->id]);
            }

            $variantRecord->formId = $formId;
            $variantRecord->weight = $variant['weight'] ?? 1;
            $variantRecord->save();

            if ($variantRecord->hasErrors()) {
                $errorCollection->fromRecord('abTestVariant-'.($variant['id'] ?? ''), $variantRecord);
            } else {
                $usedIds[] = $variantRecord->id;
            }
        }

        if ($record->hasErrors()) {
            $errorCollection->fromRecord('abTest', $record);
        }

        if ($errorCollection->hasErrors()) {
            throw new ApiException(400, $errorCollection);
        }

        $existingIds = AbTestVariantRecord::find()
            ->select(['id'])
            ->where(['abTestId' => $record->id])
            ->column()
        ;

        $idsToDelete = array_diff($existingIds, $usedIds);
        AbTestVariantRecord::deleteAll(['id' => $idsToDelete]);

        return $this->asJson($record->toArray());
    }

    public function actionList(): Response
    {
        $tests = AbTestRecord::find()->with('variants')->all();
        $serialized = array_map([$this, 'serializeTest'], $tests);

        return $this->asJson($serialized);
    }

    public function actionDelete(int $id): Response
    {
        $this->requirePostRequest();

        $record = AbTestRecord::findOne(['id' => $id]);
        if (!$record) {
            throw new NotFoundHttpException('A/B Test group not found');
        }

        $record->delete();

        return $this->asJson(['success' => true]);
    }

    public function actionDashboard(): Response
    {
        $winnerResolver = new ABTestWinnerResolver();
        $tests = AbTestRecord::find()->with('variants')->all();
        $formTitles = $this->getFormTitles($tests);
        $totals = $this->getTotalsByVariantIds($tests);
        $series = $this->getSeriesByVariantIds($tests);

        $result = [];
        foreach ($tests as $test) {
            $variants = $test->getVariants()->all();
            $variantIds = array_map(static fn (AbTestVariantRecord $variant) => (int) $variant->id, $variants);

            $variantData = [];
            $totalImpressions = 0;
            $totalInteractions = 0;
            $totalFailures = 0;
            $totalConversions = 0;
            foreach ($variants as $variant) {
                $variantId = (int) $variant->id;
                $stats = $totals[$variantId] ?? [
                    'served' => 0,
                    'interacted' => 0,
                    'failed' => 0,
                    'completed' => 0,
                ];

                $conversionRate = $stats['served'] > 0
                    ? ($stats['completed'] / $stats['served']) * 100
                    : 0.0;

                $totalImpressions += $stats['served'];
                $totalInteractions += $stats['interacted'];
                $totalFailures += $stats['failed'];
                $totalConversions += $stats['completed'];

                $variantData[] = [
                    'id' => $variantId,
                    'formId' => (int) $variant->formId,
                    'formName' => $formTitles[(int) $variant->formId] ?? null,
                    'weight' => (int) $variant->weight,
                    'stats' => [
                        'served' => $stats['served'],
                        'interacted' => $stats['interacted'],
                        'failed' => $stats['failed'],
                        'completed' => $stats['completed'],
                        'conversionRate' => $conversionRate,
                    ],
                    'series' => $series[$variantId] ?? $this->buildEmptySeries(),
                ];
            }

            $winnerVariantId = $winnerResolver->resolveWinnerVariantId(
                array_reduce(
                    $variantData,
                    static function (array $carry, array $variant): array {
                        $carry[(int) $variant['id']] = [
                            'served' => (int) $variant['stats']['served'],
                            'completed' => (int) $variant['stats']['completed'],
                        ];

                        return $carry;
                    },
                    []
                )
            );
            $isActive = $this->isActive($test, \count($variants) > 0);

            $result[] = [
                'id' => (int) $test->id,
                'name' => $test->name,
                'handle' => $test->handle,
                'description' => $test->description,
                'startDate' => $this->formatDate($test->startDate),
                'endDate' => $this->formatDate($test->endDate),
                'active' => $isActive,
                'days' => $this->calculateDays($test->startDate, $test->endDate),
                'variantCount' => \count($variantData),
                'totalImpressions' => $totalImpressions,
                'totalInteractions' => $totalInteractions,
                'totalFailures' => $totalFailures,
                'totalConversions' => $totalConversions,
                'winnerVariantId' => $winnerVariantId,
                'variants' => $variantData,
            ];
        }

        return $this->asJson($result);
    }

    private function normalizeDate(?string $value): ?string
    {
        if (!$value) {
            return null;
        }

        $timestamp = strtotime($value);
        if (!$timestamp) {
            return null;
        }

        return date('Y-m-d H:i:s', $timestamp);
    }

    private function formatDate(?string $value): ?string
    {
        if (!$value) {
            return null;
        }

        $timestamp = strtotime($value);
        if (!$timestamp) {
            return null;
        }

        return date(\DATE_ATOM, $timestamp);
    }

    private function serializeTest(AbTestRecord $test): array
    {
        $variants = [];
        foreach ($test->getVariants()->all() as $variant) {
            $variants[] = [
                'id' => (int) $variant->id,
                'formId' => (int) $variant->formId,
                'weight' => (int) $variant->weight,
            ];
        }

        return [
            'id' => (int) $test->id,
            'name' => $test->name,
            'handle' => $test->handle,
            'description' => $test->description,
            'startDate' => $this->formatDate($test->startDate),
            'endDate' => $this->formatDate($test->endDate),
            'variants' => $variants,
        ];
    }

    /**
     * @param AbTestRecord[] $tests
     */
    private function getFormTitles(array $tests): array
    {
        $formIds = [];
        foreach ($tests as $test) {
            foreach ($test->getVariants()->all() as $variant) {
                $formIds[] = (int) $variant->formId;
            }
        }

        $formIds = array_unique(array_filter($formIds));
        if (empty($formIds)) {
            return [];
        }

        $rows = (new Query())
            ->select(['id', 'name'])
            ->from(FormRecord::TABLE)
            ->where(['id' => $formIds])
            ->all()
        ;

        $titles = [];
        foreach ($rows as $row) {
            $titles[(int) $row['id']] = $row['name'];
        }

        return $titles;
    }

    /**
     * @param AbTestRecord[] $tests
     */
    private function getTotalsByVariantIds(array $tests): array
    {
        $variantIds = [];
        foreach ($tests as $test) {
            foreach ($test->getVariants()->all() as $variant) {
                $variantIds[] = (int) $variant->id;
            }
        }

        $variantIds = array_unique(array_filter($variantIds));
        if (empty($variantIds)) {
            return [];
        }

        $totals = [];
        $rows = (new Query())
            ->select(['abVariantId', 'status', 'COUNT(*) as count'])
            ->from(AbTestStatisticsRecord::TABLE)
            ->where(['abVariantId' => $variantIds])
            ->groupBy(['abVariantId', 'status'])
            ->all()
        ;

        foreach ($variantIds as $variantId) {
            $totals[$variantId] = [
                'served' => 0,
                'interacted' => 0,
                'failed' => 0,
                'completed' => 0,
            ];
        }

        foreach ($rows as $row) {
            $variantId = (int) $row['abVariantId'];
            $status = $row['status'];
            $count = (int) $row['count'];

            if ($status === AbTestStatisticsRecord::STATUS_COMPLETED) {
                $totals[$variantId]['completed'] = $count;
            } elseif ($status === AbTestStatisticsRecord::STATUS_INTERACTED) {
                $totals[$variantId]['interacted'] = $count;
            } elseif ($status === AbTestStatisticsRecord::STATUS_FAILED) {
                $totals[$variantId]['failed'] = $count;
            } elseif ($status === AbTestStatisticsRecord::STATUS_SERVED) {
                $totals[$variantId]['served'] = $count;
            }
        }

        foreach ($totals as $variantId => $stats) {
            $totals[$variantId]['served']
                = $stats['served'] + $stats['interacted'] + $stats['failed'] + $stats['completed'];

            $totals[$variantId]['interacted']
                = $stats['interacted'] + $stats['failed'] + $stats['completed'];
        }

        return $totals;
    }

    /**
     * @param AbTestRecord[] $tests
     */
    private function getSeriesByVariantIds(array $tests): array
    {
        $variantIds = [];
        foreach ($tests as $test) {
            foreach ($test->getVariants()->all() as $variant) {
                $variantIds[] = (int) $variant->id;
            }
        }

        $variantIds = array_unique(array_filter($variantIds));
        if (empty($variantIds)) {
            return [];
        }

        $startDate = date('Y-m-d 00:00:00', strtotime('-'.(self::DASHBOARD_DAYS - 1).' days'));

        $rows = (new Query())
            ->select([
                'abVariantId',
                'status',
                'DATE([[dateCreated]]) AS [[day]]',
                'COUNT(*) AS [[count]]',
            ])
            ->from(AbTestStatisticsRecord::TABLE)
            ->where(['abVariantId' => $variantIds])
            ->andWhere(['>=', 'dateCreated', $startDate])
            ->groupBy(['abVariantId', 'status', 'day'])
            ->all()
        ;

        $seriesByVariant = [];
        foreach ($variantIds as $variantId) {
            $seriesByVariant[$variantId] = $this->buildEmptySeries();
        }

        $rowsMap = [];
        foreach ($rows as $row) {
            $variantId = (int) $row['abVariantId'];
            $day = $row['day'];
            $status = $row['status'];
            $count = (int) $row['count'];

            if (!isset($rowsMap[$variantId][$day])) {
                $rowsMap[$variantId][$day] = [
                    'served' => 0,
                    'interacted' => 0,
                    'failed' => 0,
                    'completed' => 0,
                ];
            }

            if ($status === AbTestStatisticsRecord::STATUS_COMPLETED) {
                $rowsMap[$variantId][$day]['completed'] = $count;
            } elseif ($status === AbTestStatisticsRecord::STATUS_INTERACTED) {
                $rowsMap[$variantId][$day]['interacted'] = $count;
            } elseif ($status === AbTestStatisticsRecord::STATUS_FAILED) {
                $rowsMap[$variantId][$day]['failed'] = $count;
            } elseif ($status === AbTestStatisticsRecord::STATUS_SERVED) {
                $rowsMap[$variantId][$day]['served'] = $count;
            }
        }

        foreach ($seriesByVariant as $variantId => $series) {
            foreach ($series as $index => $point) {
                $day = $point['date'];
                $source = $rowsMap[$variantId][$day] ?? [
                    'served' => 0,
                    'interacted' => 0,
                    'failed' => 0,
                    'completed' => 0,
                ];

                $served = $source['served'] + $source['interacted'] + $source['failed'] + $source['completed'];
                $interacted = $source['interacted'] + $source['failed'] + $source['completed'];
                $failed = $source['failed'];
                $completed = $source['completed'];

                $seriesByVariant[$variantId][$index] = [
                    'date' => $day,
                    'impressions' => $served,
                    'interactions' => $interacted,
                    'failures' => $failed,
                    'conversions' => $completed,
                    'conversionRate' => $served > 0 ? ($completed / $served) * 100 : 0.0,
                ];
            }
        }

        return $seriesByVariant;
    }

    private function buildEmptySeries(): array
    {
        $series = [];
        for ($i = self::DASHBOARD_DAYS - 1; $i >= 0; --$i) {
            $day = date('Y-m-d', strtotime("-{$i} days"));
            $series[] = [
                'date' => $day,
                'impressions' => 0,
                'interactions' => 0,
                'failures' => 0,
                'conversions' => 0,
                'conversionRate' => 0.0,
            ];
        }

        return $series;
    }

    private function isActive(AbTestRecord $test, bool $hasVariants): bool
    {
        if (!$hasVariants || !$test->startDate) {
            return false;
        }

        $now = time();
        $start = strtotime($test->startDate);
        if (!$start || $start > $now) {
            return false;
        }

        if (!$test->endDate) {
            return true;
        }

        $end = strtotime($test->endDate);

        return !$end || $end > $now;
    }

    private function calculateDays(?string $startDate, ?string $endDate): int
    {
        $start = $startDate ? strtotime($startDate) : false;
        if (!$start) {
            return 0;
        }

        $end = time();
        if ($endDate) {
            $endTimestamp = strtotime($endDate);
            if ($endTimestamp && $endTimestamp < $end) {
                $end = $endTimestamp;
            }
        }

        if ($end < $start) {
            return 0;
        }

        return (int) floor(($end - $start) / 86400);
    }
}
