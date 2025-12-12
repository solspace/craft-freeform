<?php

namespace Solspace\Freeform\Bundles\ABTesting\Providers;

use Solspace\Freeform\Records\AbTests\AbTestRecord;
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

        $total = array_sum(array_map(fn (AbTestVariantRecord $variant) => $variant->weight, $variants)); // 110
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
}
