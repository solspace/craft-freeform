<?php

namespace Solspace\Freeform\Tests\Library\Activity;

use PHPUnit\Framework\Attributes\CoversNothing;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\Activity\ActivityInput;

#[CoversNothing]
class ActivityInputTest extends TestCase
{
    public function testLoggingStylesAreExplicitAndCannotBeCoerced(): void
    {
        self::assertSame('activity', ActivityInput::loggingStyle('activity'));
        self::assertSame('none', ActivityInput::loggingStyle('none'));
        $this->expectException(\InvalidArgumentException::class);
        ActivityInput::loggingStyle('classic');
    }

    #[TestWith(['minimal'])]
    #[TestWith(['standard'])]
    #[TestWith(['detailed'])]
    public function testUnifiedChoiceEnablesItsModeRegardlessOfRememberedMode(string $mode): void
    {
        self::assertSame(
            ['loggingStyle' => 'activity', 'activityMode' => $mode],
            ActivityInput::recordingSettings(['activityLogging' => $mode, 'activityMode' => 'custom'], 'none', 'custom'),
        );
    }

    public function testOffRetainsTheLastSelectedModeAndUnsavedCustomChoices(): void
    {
        $events = ['error' => '', 'submission' => '1'];
        self::assertSame(
            ['loggingStyle' => 'none', 'activityMode' => 'custom', 'activityEvents' => $events],
            ActivityInput::recordingSettings(['activityLogging' => 'off', 'activityMode' => 'custom', 'activityEvents' => $events], 'activity', 'standard'),
        );
    }

    public function testOffWithoutSubmittedPreferencesPreservesSavedModeAndEvents(): void
    {
        $settings = ActivityInput::recordingSettings(['activityLogging' => 'off'], 'activity', 'custom');
        self::assertSame(['loggingStyle' => 'none', 'activityMode' => 'custom'], $settings);
        self::assertSame(['error' => false], array_replace(['activityEvents' => ['error' => false]], $settings)['activityEvents']);
    }

    public function testCustomAcceptsExplicitlyDisabledEventChoices(): void
    {
        $events = ['error' => '', 'submission' => ''];
        self::assertSame(
            ['loggingStyle' => 'activity', 'activityMode' => 'custom', 'activityEvents' => $events],
            ActivityInput::recordingSettings(['activityLogging' => 'custom', 'activityEvents' => $events], 'none', 'standard'),
        );
    }

    public function testLegacyRecordingSubmissionsRemainCompatible(): void
    {
        self::assertSame(
            ['loggingStyle' => 'none', 'activityMode' => 'detailed'],
            ActivityInput::recordingSettings(['loggingStyle' => 'none', 'activityMode' => 'detailed'], 'activity', 'standard'),
        );
        self::assertSame(
            ['loggingStyle' => 'activity', 'activityMode' => 'minimal'],
            ActivityInput::recordingSettings(['activityMode' => 'minimal'], 'activity', 'standard'),
        );
    }

    #[TestWith([['activityLogging' => ['off']]])]
    #[TestWith([['activityLogging' => 'unknown']])]
    #[TestWith([['activityLogging' => null]])]
    #[TestWith([['activityLogging' => 'off', 'activityMode' => ['custom']]])]
    #[TestWith([['activityLogging' => 'off', 'activityMode' => 'unknown']])]
    #[TestWith([['activityLogging' => 'custom']])]
    #[TestWith([['activityLogging' => 'custom', 'activityEvents' => 'false']])]
    #[TestWith([['activityLogging' => 'off', 'activityMode' => 'custom', 'activityEvents' => 'false']])]
    #[TestWith([['loggingStyle' => 'classic', 'activityMode' => 'minimal']])]
    #[TestWith([['loggingStyle' => 'activity']])]
    public function testMalformedRecordingSubmissionsAreRejected(array $params): void
    {
        $this->expectException(\InvalidArgumentException::class);
        ActivityInput::recordingSettings($params, 'activity', 'standard');
    }

    public function testAllChoicesNormalizeToAnUnfilteredQuery(): void
    {
        self::assertSame(ActivityInput::filters([]), ActivityInput::filters(['category' => 'all', 'level' => 'all', 'resolution' => 'all']));
    }

    #[TestWith([['q' => ['private@example.test']]])]
    #[TestWith([['formId' => ['10']]])]
    #[TestWith([['submissionId' => '-1']])]
    #[TestWith([['category' => 'unknown']])]
    #[TestWith([['level' => 'unknown']])]
    #[TestWith([['days' => '366']])]
    #[TestWith([['days' => ['7']]])]
    #[TestWith([['days' => '-1']])]
    #[TestWith([['resolution' => 'unknown']])]
    #[TestWith([['resolution' => ['open']]])]
    public function testMalformedFiltersAreRejectedWithoutSerializingTheirValues(array $params): void
    {
        try {
            ActivityInput::filters($params);
            self::fail('Malformed filter was accepted.');
        } catch (\InvalidArgumentException $exception) {
            self::assertStringNotContainsString('private@example.test', $exception->getMessage());
        }
    }

    #[TestWith(['false'])]
    #[TestWith(['0'])]
    #[TestWith([''])]
    #[TestWith([false])]
    public function testFalseRecordingSettingsCannotSilentlyEnableTracking(mixed $value): void
    {
        self::assertSame('0', ActivityInput::enabled($value));
    }

    public function testSearchLengthAndIdentifiersAreBounded(): void
    {
        $filters = ActivityInput::filters(['q' => str_repeat('x', 1000), 'formId' => '42']);
        self::assertSame(80, mb_strlen($filters['q']));
        self::assertSame(42, $filters['formId']);
        self::assertSame(0, ActivityInput::id(''));
    }
}
