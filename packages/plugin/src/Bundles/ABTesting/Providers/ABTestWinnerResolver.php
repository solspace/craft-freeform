<?php

namespace Solspace\Freeform\Bundles\ABTesting\Providers;

class ABTestWinnerResolver
{
    /**
     * @param array<int, array{served:int, completed:int}> $scoresByVariantId
     */
    public function resolveWinnerVariantId(array $scoresByVariantId): ?int
    {
        if (empty($scoresByVariantId)) {
            return null;
        }

        $anyScore = max(
            0,
            array_sum(array_column($scoresByVariantId, 'served')),
            array_sum(array_column($scoresByVariantId, 'completed'))
        );

        if (0 === $anyScore) {
            return null;
        }

        $winnerId = null;
        foreach ($scoresByVariantId as $variantId => $score) {
            if (null === $winnerId) {
                $winnerId = (int) $variantId;

                continue;
            }

            $completed = $score['completed'];
            $served = $score['served'];
            $winnerCompleted = $scoresByVariantId[$winnerId]['completed'];
            $winnerServed = $scoresByVariantId[$winnerId]['served'];

            $currentRate = $this->rate($completed, $served);
            $winnerRate = $this->rate($winnerCompleted, $winnerServed);

            $isRateBetter = $currentRate > $winnerRate;
            $isRateEqual = $currentRate === $winnerRate;
            $isCompletedBetter = $completed > $winnerCompleted;
            $isCompletedEqual = $completed === $winnerCompleted;

            if (
                $isRateBetter
                || ($isRateEqual && $isCompletedBetter)
                || ($isRateEqual && $isCompletedEqual && (int) $variantId < $winnerId)
            ) {
                $winnerId = (int) $variantId;
            }
        }

        return $winnerId;
    }

    private function rate(int $completed, int $served): float
    {
        if ($served <= 0) {
            return 0.0;
        }

        return $completed / $served;
    }
}
