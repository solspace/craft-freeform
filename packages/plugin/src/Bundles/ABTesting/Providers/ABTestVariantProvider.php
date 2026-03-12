<?php

namespace Solspace\Freeform\Bundles\ABTesting\Providers;

use craft\db\Query;
use Solspace\Freeform\Records\AbTests\AbTestRecord;
use Solspace\Freeform\Records\AbTests\AbTestStatisticsRecord;
use Solspace\Freeform\Records\AbTests\AbTestVariantRecord;

class ABTestVariantProvider
{
    public function __construct(
        private ABTestVariantPersistence $persistence,
    ) {}

    public function getVariant(string $testName): ?AbTestVariantRecord
    {
        $test = AbTestRecord::findOne(['name' => $testName]);
        if (!$test) {
            return null;
        }

        if ($this->isEnded($test)) {
            return $this->getWinningVariant($test);
        }

        return $this->getAssignedVariant($test);
    }

    private function getAssignedVariant(AbTestRecord $test): ?AbTestVariantRecord
    {
        $variant = $this->persistence->getPersistedVariant($test);
        if ($variant) {
            return $variant;
        }

        $variant = $this->getRandomAssignedVariant($test);
        $this->persistence->persistVariation($variant);

        return $variant;
    }

    private function getRandomAssignedVariant(AbTestRecord $test): AbTestVariantRecord
    {
        /** @var AbTestVariantRecord[] $variants */
        $variants = $test->getVariants()->all();

        $total = array_sum(array_map(static fn (AbTestVariantRecord $variant) => $variant->weight, $variants)); // 110
        $rand = random_int(1, $total);

        $running = 0;
        foreach ($variants as $variant) {
            $running += $variant->weight;
            if ($rand <= $running) {
                return $variant;
            }
        }

        return reset($variants);
    }

    private function isEnded(AbTestRecord $test): bool
    {
        if (!$test->endDate) {
            return false;
        }

        $end = strtotime($test->endDate);

        return (bool) $end && $end <= time();
    }

    private function getWinningVariant(AbTestRecord $test): ?AbTestVariantRecord
    {
        /** @var AbTestVariantRecord[] $variants */
        $variants = $test->getVariants()->all();
        if (!$variants) {
            return null;
        }

        $variantIds = array_map(static fn (AbTestVariantRecord $variant) => (int) $variant->id, $variants);

        $rows = (new Query())
            ->select(['abVariantId', 'status', 'COUNT(*) as count'])
            ->from(AbTestStatisticsRecord::TABLE)
            ->where(['abVariantId' => $variantIds])
            ->groupBy(['abVariantId', 'status'])
            ->all()
        ;

        $scores = [];
        foreach ($variantIds as $variantId) {
            $scores[$variantId] = [
                'served' => 0,
                'interacted' => 0,
                'failed' => 0,
                'completed' => 0,
                'rate' => 0.0,
            ];
        }

        foreach ($rows as $row) {
            $variantId = (int) $row['abVariantId'];
            $status = $row['status'];
            $count = (int) $row['count'];

            if (AbTestStatisticsRecord::STATUS_COMPLETED === $status) {
                $scores[$variantId]['completed'] = $count;
            } elseif (AbTestStatisticsRecord::STATUS_INTERACTED === $status) {
                $scores[$variantId]['interacted'] = $count;
            } elseif (AbTestStatisticsRecord::STATUS_FAILED === $status) {
                $scores[$variantId]['failed'] = $count;
            } elseif (AbTestStatisticsRecord::STATUS_SERVED === $status) {
                $scores[$variantId]['served'] = $count;
            }
        }

        foreach ($scores as $variantId => $data) {
            $served = $data['served'] + $data['interacted'] + $data['failed'] + $data['completed'];
            $scores[$variantId]['served'] = $served;
            $scores[$variantId]['interacted'] = $data['interacted'] + $data['failed'] + $data['completed'];
            $scores[$variantId]['rate'] = $served > 0 ? $data['completed'] / $served : 0.0;
        }

        $winnerId = null;
        foreach ($variantIds as $variantId) {
            if (null === $winnerId) {
                $winnerId = $variantId;

                continue;
            }

            $current = $scores[$variantId];
            $best = $scores[$winnerId];

            if (
                $current['rate'] > $best['rate']
                || (
                    $current['rate'] === $best['rate']
                    && $current['completed'] > $best['completed']
                )
                || (
                    $current['rate'] === $best['rate']
                    && $current['completed'] === $best['completed']
                    && $variantId < $winnerId
                )
            ) {
                $winnerId = $variantId;
            }
        }

        foreach ($variants as $variant) {
            if ((int) $variant->id === $winnerId) {
                return $variant;
            }
        }

        return reset($variants) ?: null;
    }
}
