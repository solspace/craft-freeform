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

        $winnerId = null;
        foreach ($scoresByVariantId as $variantId => $score) {
            if (null === $winnerId) {
                $winnerId = (int) $variantId;

                continue;
            }

            $currentRate = $this->rate($score['completed'], $score['served']);
            $winnerRate = $this->rate(
                $scoresByVariantId[$winnerId]['completed'],
                $scoresByVariantId[$winnerId]['served']
            );

            if (
                $currentRate > $winnerRate
                || (
                    $currentRate === $winnerRate
                    && $score['completed'] > $scoresByVariantId[$winnerId]['completed']
                )
                || (
                    $currentRate === $winnerRate
                    && $score['completed'] === $scoresByVariantId[$winnerId]['completed']
                    && (int) $variantId < $winnerId
                )
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
