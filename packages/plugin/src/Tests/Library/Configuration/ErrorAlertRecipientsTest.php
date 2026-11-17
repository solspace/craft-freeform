<?php

namespace Solspace\Freeform\Tests\Library\Configuration;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\Configuration\ErrorAlertRecipients;
use Solspace\Freeform\Models\Settings;
use Solspace\Freeform\Services\SettingsService;
use Solspace\Freeform\Tests\Helpers\UsesCraft6Container;

#[CoversClass(ErrorAlertRecipients::class)]
class ErrorAlertRecipientsTest extends TestCase
{
    use UsesCraft6Container;

    #[TestWith([null, 'mail@example.test', 'mail@example.test'])]
    #[TestWith(['ops@example.test', null, 'ops@example.test'])]
    #[TestWith(['ops@example.test', 'mail@example.test', 'ops@example.test, mail@example.test'])]
    #[TestWith(['ops@example.test, SAME@example.test', 'same@example.test; mail@example.test', 'ops@example.test, SAME@example.test, mail@example.test'])]
    #[TestWith(['', '', ''])]
    #[TestWith([null, null, ''])]
    #[TestWith(['$FF_OPERATIONS_ALERTS', '$FF_EMAIL_ALERTS', '$FF_OPERATIONS_ALERTS, $FF_EMAIL_ALERTS'])]
    public function testLegacyAndCurrentRecipientsSurviveLoadingAndSaving(?string $current, ?string $legacy, string $expected): void
    {
        $model = new Settings(['errorNotificationRecipients' => $current, 'alertNotificationRecipients' => $legacy]);
        self::assertSame($expected ?: null, $model->errorNotificationRecipients);
        $saved = $model->toArray();
        self::assertArrayNotHasKey('alertNotificationRecipients', $saved);
        self::assertSame($expected ?: null, (new Settings($saved))->errorNotificationRecipients);
        // Explicitly clearing the new field must not resurrect the retired list.
        $model->setAttributes(['errorNotificationRecipients' => ''], false);
        self::assertNull($model->errorNotificationRecipients);
    }

    public function testPartialLegacyPhpOverrideMergesWithAlreadyLoadedRecipients(): void
    {
        $model = new Settings(['errorNotificationRecipients' => 'ops@example.test']);
        $model->setAttributes(['alertNotificationRecipients' => 'mail@example.test'], false);
        self::assertSame('ops@example.test, mail@example.test', $model->errorNotificationRecipients);
    }

    public function testEnvironmentReferencesStayConfiguredAndResolveToDeduplicatedAddresses(): void
    {
        $beforeOps = getenv('FF_TEST_OPERATIONS_ALERTS');
        $beforeEmail = getenv('FF_TEST_EMAIL_ALERTS');
        putenv('FF_TEST_OPERATIONS_ALERTS=ops@example.test, shared@example.test');
        putenv('FF_TEST_EMAIL_ALERTS=SHARED@example.test, mail@example.test');

        try {
            $model = new Settings(['errorNotificationRecipients' => '$FF_TEST_OPERATIONS_ALERTS', 'alertNotificationRecipients' => '$FF_TEST_EMAIL_ALERTS']);
            self::assertSame('$FF_TEST_OPERATIONS_ALERTS, $FF_TEST_EMAIL_ALERTS', $model->errorNotificationRecipients);
            $service = $this->getMockBuilder(SettingsService::class)->onlyMethods(['getSettingsModel'])->getMock();
            $service->method('getSettingsModel')->willReturn($model);
            self::assertSame(['ops@example.test', 'shared@example.test', 'mail@example.test'], $service->getErrorNotificationRecipients()->emailsToArray());
            self::assertTrue($service->isErrorNotificationEnabled());
            putenv('FF_TEST_OPERATIONS_ALERTS=');
            putenv('FF_TEST_EMAIL_ALERTS=');
            self::assertFalse($service->isErrorNotificationEnabled());
        } finally {
            putenv(false === $beforeOps ? 'FF_TEST_OPERATIONS_ALERTS' : 'FF_TEST_OPERATIONS_ALERTS='.$beforeOps);
            putenv(false === $beforeEmail ? 'FF_TEST_EMAIL_ALERTS' : 'FF_TEST_EMAIL_ALERTS='.$beforeEmail);
        }
    }
}
