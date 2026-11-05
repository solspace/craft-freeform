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
        self::assertSame('classic', ActivityInput::loggingStyle('classic'));
        self::assertSame('none', ActivityInput::loggingStyle('none'));
        $this->expectException(\InvalidArgumentException::class);
        ActivityInput::loggingStyle(['classic']);
    }

    public function testAllChoicesNormalizeToAnUnfilteredQuery(): void
    {
        self::assertSame(ActivityInput::filters([]), ActivityInput::filters(['category' => 'all', 'level' => 'all']));
    }

    #[TestWith([['q' => ['private@example.test']]])]
    #[TestWith([['formId' => ['10']]])]
    #[TestWith([['submissionId' => '-1']])]
    #[TestWith([['category' => 'unknown']])]
    #[TestWith([['level' => 'unknown']])]
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

    #[TestWith(['0', 'error'])]
    #[TestWith(['1', 'info'])]
    #[TestWith(['$FREEFORM_TECHNICAL_LOGGING', 'debug'])]
    public function testTechnicalLoggingPreservesSeparateFileSettings(string $enabled, string $level): void
    {
        $settings = ['technicalFileLogging' => $enabled, 'loggingLevel' => $level];
        self::assertSame(['loggingLevel' => $level], ActivityInput::technicalLogging($settings + ['activityEnabled' => '0', 'pluginName' => 'Unrelated']));
    }

    public function testOmittedTechnicalSettingsDoNotOverwriteSavedValues(): void
    {
        self::assertSame([], ActivityInput::technicalLogging(['activityEnabled' => '1']));
        self::assertSame(['loggingLevel' => 'error'], ActivityInput::technicalLogging(['loggingLevel' => 'error']));
    }

    #[TestWith([['loggingLevel' => ['debug']]])]
    #[TestWith([['loggingLevel' => 'unknown']])]
    public function testMalformedTechnicalSettingsAreRejected(array $settings): void
    {
        $this->expectException(\InvalidArgumentException::class);
        ActivityInput::technicalLogging($settings);
    }
}
