<?php

namespace Solspace\Freeform\Tests\Library\Activity;

use PHPUnit\Framework\Attributes\CoversNothing;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\Activity\ActivityPolicy;
use Solspace\Freeform\Models\Settings;

#[CoversNothing]
class ActivityPolicyTest extends TestCase
{
    public function testMinimalRecordsOnlyFailuresAndCustomCanDisableEverything(): void
    {
        self::assertSame(['error', 'email-error', 'integration-error'], array_keys(array_filter(ActivityPolicy::options('minimal'))));
        self::assertSame([], array_filter(ActivityPolicy::options('custom', array_fill_keys(array_keys(ActivityPolicy::EVENTS), false))));
        self::assertSame(ActivityPolicy::options('standard'), ActivityPolicy::options('custom'));
        self::assertCount(10, ActivityPolicy::EVENTS);
    }

    public function testStandardAndDetailedHaveExplicitBoundaries(): void
    {
        $standard = ActivityPolicy::options('standard');
        self::assertTrue($standard['submission']);
        self::assertFalse($standard['email-sent']);
        self::assertFalse($standard['integration-response']);
        self::assertCount(6, array_filter($standard));
        self::assertFalse($standard['validation']);
        self::assertFalse($standard['form-change']);
        self::assertNotContains(false, ActivityPolicy::options('detailed'));
        self::assertSame(ActivityPolicy::options('minimal'), ActivityPolicy::options('unknown'));
    }

    public function testCustomHonorsExplicitFalseValuesAndRejectsUnknownEvents(): void
    {
        $options = ActivityPolicy::options('custom', ['email-error' => '0', 'error' => false, 'submission' => '1', 'spam' => 'false', 'form-change' => true, 'raw-payloads' => true]);
        self::assertSame(['submission', 'form-change'], array_keys(array_filter($options)));
        self::assertArrayNotHasKey('raw-payloads', $options);
    }

    public function testMetadataCannotIncludeSecretsOrArbitraryTextEvenUnderAllowedKeys(): void
    {
        $metadata = ActivityPolicy::metadata([
            'httpStatus' => 401,
            'integrationId' => 12,
            'password' => 'secret',
            'recipient' => 'private@example.test',
            'message' => 'Bearer sensitive-token',
            'payload' => ['email' => 'private@example.test'],
            'siteId' => 'private@example.test',
            'notificationId' => new \stdClass(),
            'errorCount' => -1,
            'attempt' => '2',
        ]);
        self::assertSame(['httpStatus' => 401, 'integrationId' => 12], $metadata);
        self::assertLessThan(100, \strlen(json_encode($metadata)));
    }

    public function testFreshInstallDefaultIsStandard(): void
    {
        self::assertSame('standard', (new \ReflectionClass(Settings::class))->getDefaultProperties()['activityMode']);
    }

    #[TestWith(['minimal'])]
    #[TestWith(['standard'])]
    #[TestWith(['detailed'])]
    public function testPresetsIgnoreStoredCustomChoices(string $mode): void
    {
        self::assertSame(ActivityPolicy::options($mode), ActivityPolicy::options($mode, array_fill_keys(array_keys(ActivityPolicy::EVENTS), false)));
    }
}
