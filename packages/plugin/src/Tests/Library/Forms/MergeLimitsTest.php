<?php

namespace Solspace\Freeform\Tests\Library\Forms;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\Forms\Merge\MergeLimits;

#[CoversClass(MergeLimits::class)]
class MergeLimitsTest extends TestCase
{
    public function testSubmissionLimitAccountsForBothRowCountAndFieldCount(): void
    {
        self::assertSame(10_000, MergeLimits::submissionLimit(0));
        self::assertSame(10_000, MergeLimits::submissionLimit(25));
        self::assertSame(2_500, MergeLimits::submissionLimit(100));
    }

    public function testMappingReservesRoomForOtherPostInputs(): void
    {
        self::assertTrue(MergeLimits::allowsMapping(90, 2, 100));
        self::assertFalse(MergeLimits::allowsMapping(91, 2, 100));
        self::assertTrue(MergeLimits::allowsMapping(91, 2, -1));
    }

    public function testMappingRejectsTooManyOptionsBeforeBuildingDropdowns(): void
    {
        self::assertTrue(MergeLimits::allowsMapping(250, 100, 1_000));
        self::assertFalse(MergeLimits::allowsMapping(250, 101, 1_000));
    }

    public function testBatchesShrinkForWideRows(): void
    {
        self::assertSame(250, MergeLimits::batchSize(0));
        self::assertSame(5, MergeLimits::batchSize(100));
        self::assertSame(1, MergeLimits::batchSize(600));
    }
}
