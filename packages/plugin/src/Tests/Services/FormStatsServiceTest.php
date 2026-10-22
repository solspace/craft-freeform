<?php

namespace Solspace\Freeform\Tests\Services;

use Carbon\Carbon;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Services\FormStatsService;
use Solspace\Freeform\Services\SettingsService;

/**
 * @coversNothing
 */
class FormStatsServiceTest extends TestCase
{
    protected function tearDown(): void
    {
        Carbon::setTestNow();
    }

    public function testNinetyUtcDaysIncludeTodayAndSeparateSpamFromSubmissions(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-03-01 00:05:00', 'UTC'));
        $settings = $this->createMock(SettingsService::class);
        $settings->method('isSpamFolderEnabled')->willReturn(true);
        $service = $this->getMockBuilder(FormStatsService::class)
            ->setConstructorArgs([$settings])
            ->onlyMethods(['getDailyCounts', 'getStoredCounts', 'getBlockedSpamCount'])
            ->getMock()
        ;
        $service->expects(self::once())->method('getStoredCounts')->with(15)
            ->willReturn([
                ['spam' => '0', 'count' => '42', 'lastSubmissionAt' => '2026-02-28 23:59:58'],
                ['spam' => '1', 'count' => '8', 'lastSubmissionAt' => '2026-03-01 00:04:59'],
            ])
        ;
        $service->expects(self::never())->method('getBlockedSpamCount');
        $service->expects(self::once())->method('getDailyCounts')
            ->with(15, self::callback(static fn (Carbon $date) => '2025-12-02 00:00:00' === $date->toDateTimeString()), self::anything())
            ->willReturn([
                ['date' => '2025-12-02', 'spam' => '0', 'count' => '2'],
                ['date' => '2026-03-01', 'spam' => '0', 'count' => '3'],
                ['date' => '2026-03-01', 'spam' => '1', 'count' => '4'],
            ])
        ;

        $stats = $service->getStats(15);
        self::assertCount(90, $stats['daily']);
        self::assertSame(['date' => '2025-12-02', 'submissions' => 2, 'spam' => 0], $stats['daily'][0]);
        self::assertSame(['date' => '2025-12-03', 'submissions' => 0, 'spam' => 0], $stats['daily'][1]);
        self::assertSame(['date' => '2026-03-01', 'submissions' => 3, 'spam' => 4], $stats['daily'][89]);
        self::assertSame(['submissions' => 42, 'spam' => 8], $stats['totals']);
        self::assertSame('2026-02-28T23:59:58+00:00', $stats['lastSubmissionAt']);
        self::assertSame('2026-03-01T00:05:00+00:00', $stats['generatedAt']);
    }

    public function testEmptyFormHasZeroTotalsAndRecordsUnavailableSpamHistory(): void
    {
        Carbon::setTestNow(Carbon::parse('2024-03-01 23:59:59', 'UTC'));
        $settings = $this->createMock(SettingsService::class);
        $settings->method('isSpamFolderEnabled')->willReturn(false);
        $service = $this->getMockBuilder(FormStatsService::class)
            ->setConstructorArgs([$settings])
            ->onlyMethods(['getDailyCounts', 'getStoredCounts', 'getBlockedSpamCount'])
            ->getMock()
        ;
        $service->method('getDailyCounts')->willReturn([]);
        $service->method('getStoredCounts')->with(15)->willReturn([]);
        $service->method('getBlockedSpamCount')->with(15)->willReturn(27);

        $stats = $service->getStats(15);
        self::assertCount(90, $stats['daily']);
        self::assertSame('2024-03-01', $stats['daily'][89]['date']);
        self::assertSame('2024-02-29', $stats['daily'][88]['date']);
        self::assertSame(0, array_sum(array_column($stats['daily'], 'submissions')));
        self::assertSame(0, array_sum(array_column($stats['daily'], 'spam')));
        self::assertSame(['submissions' => 0, 'spam' => 27], $stats['totals']);
        self::assertFalse($stats['spamStored']);
        self::assertNull($stats['lastSubmissionAt']);
    }

    public function testLastSubmissionCanBeOlderThanTheChartWindow(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-03-01 00:05:00', 'UTC'));
        $settings = $this->createMock(SettingsService::class);
        $settings->method('isSpamFolderEnabled')->willReturn(true);
        $service = $this->getMockBuilder(FormStatsService::class)
            ->setConstructorArgs([$settings])
            ->onlyMethods(['getDailyCounts', 'getStoredCounts'])
            ->getMock()
        ;
        $service->method('getDailyCounts')->willReturn([]);
        $service->method('getStoredCounts')->with(15)->willReturn([
            ['spam' => '0', 'count' => '1', 'lastSubmissionAt' => '2024-12-31 23:59:58'],
        ]);

        $stats = $service->getStats(15);
        self::assertSame(0, array_sum(array_column($stats['daily'], 'submissions')));
        self::assertSame('2024-12-31T23:59:58+00:00', $stats['lastSubmissionAt']);
    }

    public function testSpamAloneDoesNotSetTheLastSubmissionDate(): void
    {
        $settings = $this->createMock(SettingsService::class);
        $settings->method('isSpamFolderEnabled')->willReturn(true);
        $service = $this->getMockBuilder(FormStatsService::class)
            ->setConstructorArgs([$settings])
            ->onlyMethods(['getDailyCounts', 'getStoredCounts'])
            ->getMock()
        ;
        $service->method('getDailyCounts')->willReturn([]);
        $service->method('getStoredCounts')->willReturn([
            ['spam' => '1', 'count' => '3', 'lastSubmissionAt' => '2026-02-28 20:15:00'],
        ]);

        $stats = $service->getStats(15);
        self::assertSame(['submissions' => 0, 'spam' => 3], $stats['totals']);
        self::assertNull($stats['lastSubmissionAt']);
    }

    public function testSelectedWindowsIncludeTodayAndUnsupportedLengthsDefaultToNinetyDays(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-10-20 18:30:00', 'UTC'));
        foreach ([7 => 7, 30 => 30, 90 => 90, 365 => 365, 0 => 90, 1000000 => 90] as $requested => $expected) {
            $settings = $this->createMock(SettingsService::class);
            $settings->method('isSpamFolderEnabled')->willReturn(true);
            $service = $this->getMockBuilder(FormStatsService::class)
                ->setConstructorArgs([$settings])
                ->onlyMethods(['getDailyCounts', 'getStoredCounts'])
                ->getMock()
            ;
            $start = Carbon::now('UTC')->startOfDay()->subDays($expected - 1)->toDateTimeString();
            $service->expects(self::once())->method('getDailyCounts')
                ->with(15, self::callback(static fn (Carbon $date) => $start === $date->toDateTimeString()), self::anything())
                ->willReturn([])
            ;
            $service->method('getStoredCounts')->willReturn([
                ['spam' => '0', 'count' => '42', 'lastSubmissionAt' => '2026-10-19 12:00:00'],
            ]);

            $stats = $service->getStats(15, $requested);
            self::assertSame($expected, $stats['days']);
            self::assertCount($expected, $stats['daily']);
            self::assertSame('2026-10-20', $stats['daily'][$expected - 1]['date']);
            self::assertSame(['submissions' => 42, 'spam' => 0], $stats['totals']);
        }
    }
}
