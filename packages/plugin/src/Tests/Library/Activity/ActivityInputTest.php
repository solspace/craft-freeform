<?php

namespace Solspace\Freeform\Tests\Library\Activity;

use PHPUnit\Framework\Attributes\CoversNothing;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\Activity\ActivityInput;

#[CoversNothing]
class ActivityInputTest extends TestCase
{
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
}
