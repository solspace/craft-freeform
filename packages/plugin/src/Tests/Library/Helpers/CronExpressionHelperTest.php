<?php

namespace Solspace\Freeform\Tests\Library\Helpers;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\Helpers\CronExpressionHelper;

#[CoversClass(CronExpressionHelper::class)]
class CronExpressionHelperTest extends TestCase
{
    #[DataProvider('validExpressions')]
    public function testValidExpressions(string $expression): void
    {
        self::assertTrue(CronExpressionHelper::isValid($expression));
    }

    public static function validExpressions(): array
    {
        return [['0 0 1 * *'], ['*/15 9-17 * * MON-FRI'], ['0 0 1,15 * *']];
    }

    #[DataProvider('invalidExpressions')]
    public function testInvalidExpressions(string $expression): void
    {
        self::assertFalse(CronExpressionHelper::isValid($expression));
    }

    public static function invalidExpressions(): array
    {
        return [['0 0 1 *'], ['60 0 * * *'], ['0 0 */0 * *'], ['not a cron expression']];
    }

    public function testMatchesMonthlySchedule(): void
    {
        self::assertTrue(CronExpressionHelper::isDue('0 0 1,15 * *', new \DateTimeImmutable('2026-08-15 00:00:00')));
        self::assertFalse(CronExpressionHelper::isDue('0 0 1,15 * *', new \DateTimeImmutable('2026-08-16 00:00:00')));
    }

    public function testTreatsZeroAndSevenAsSunday(): void
    {
        $sunday = new \DateTimeImmutable('2026-08-16 00:00:00');

        self::assertTrue(CronExpressionHelper::isDue('0 0 * * 0', $sunday));
        self::assertTrue(CronExpressionHelper::isDue('0 0 * * 7', $sunday));
    }
}
