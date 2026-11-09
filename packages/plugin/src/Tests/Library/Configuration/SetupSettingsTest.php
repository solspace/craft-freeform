<?php

namespace Solspace\Freeform\Tests\Library\Configuration;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\Configuration\SetupSettings;
use Solspace\Freeform\Models\Settings;

#[CoversClass(SetupSettings::class)]
class SetupSettingsTest extends TestCase
{
    public function testOnlyChangedValuesAreReturnedAndOtherSettingsStayUntouched(): void
    {
        $settings = $this->settings();
        $settings->activityEvents = ['email.sent'];
        $original = SetupSettings::values($settings);
        self::assertSame(['emailTemplateMethod' => 'all'], SetupSettings::changes(['emailTemplateMethod' => 'all', 'spamFolderEnabled' => 'true'], $original, $original, []));
        self::assertSame(['email.sent'], $settings->activityEvents);
        self::assertSame('form', $settings->emailTemplateMethod);
    }

    public function testBooleanValuesAndDisabledLegacyLoggingArePresentedConsistently(): void
    {
        $settings = $this->settings();
        $settings->spamFolderEnabled = '1';
        $settings->activityEnabled = '0';
        $values = SetupSettings::values($settings);
        self::assertSame('true', $values['spamFolderEnabled']);
        self::assertSame('none', $values['loggingStyle']);
        self::assertSame(['loggingStyle' => 'activity', 'activityEnabled' => 'true'], SetupSettings::changes(['loggingStyle' => 'activity'], $values, $values, []));
        self::assertSame(['loggingStyle' => 'classic', 'technicalFileLogging' => 'true'], SetupSettings::changes(['loggingStyle' => 'classic'], $values, $values, []));
    }

    public function testEnvironmentAndPhpConfigurationRemainLocked(): void
    {
        $settings = $this->settings();
        $settings->spamFolderEnabled = '$SPAM_FOLDER';
        self::assertSame(['emailTemplateMethod', 'spamFolderEnabled', 'loggingStyle'], SetupSettings::locked($settings, ['emailTemplateMethod' => 'global', 'technicalFileLogging' => false]));
        $values = SetupSettings::values($settings);
        $this->expectException(\DomainException::class);
        SetupSettings::changes(['emailTemplateMethod' => 'all'], $values, $values, ['emailTemplateMethod']);
    }

    public function testChangedSettingsCannotBeOverwrittenFromAStaleGuide(): void
    {
        $original = SetupSettings::values($this->settings());
        $current = array_replace($original, ['emailTemplateMethod' => 'global']);
        $this->expectException(\RuntimeException::class);
        $this->expectExceptionCode(409);
        SetupSettings::changes(['emailTemplateMethod' => 'all'], $original, $current, []);
    }

    public function testRetryAfterAnInterruptedSuccessIsAnIdempotentNoOp(): void
    {
        $original = SetupSettings::values($this->settings());
        $current = array_replace($original, ['emailTemplateMethod' => 'all']);
        self::assertSame([], SetupSettings::changes(['emailTemplateMethod' => 'all'], $original, $current, []));
    }

    #[TestWith([['purgableSubmissionAgeInDays' => '1']])]
    #[TestWith([['queuePingToken' => 'new-token']])]
    #[TestWith([['defaults' => []]])]
    #[TestWith([['loggingStyle' => 'invalid']])]
    #[TestWith([['spamFolderEnabled' => []]])]
    #[TestWith([['defaultFromEmail' => "admin@example.com\nBcc: other@example.com"]])]
    #[TestWith([['defaultFromEmail' => 'invalid-address']])]
    public function testInvalidValuesAndUnrelatedSettingWritesAreRejected(array $changes): void
    {
        $original = SetupSettings::values($this->settings());
        $this->expectException(\InvalidArgumentException::class);
        SetupSettings::changes($changes, $original, $original, []);
    }

    public function testSenderTwigVariablesAndExplicitlyClearedValuesAreRetained(): void
    {
        $original = SetupSettings::values($this->settings());
        self::assertSame(['defaultFromEmail' => '{{ general.systemEmail }}', 'defaultFromName' => ''], SetupSettings::changes(['defaultFromEmail' => '{{ general.systemEmail }}', 'defaultFromName' => ''], $original, $original, []));
    }

    public function testNestedDefaultsPreserveSiblingValuesAndLockFlags(): void
    {
        $stored = ['queuePingToken' => 'keep', 'defaults' => ['props' => ['file' => ['count' => ['value' => '1', 'locked' => true], 'source' => ['value' => '4', 'locked' => false]]], 'settings' => ['processing' => ['ajax' => ['value' => true]]]]];
        $merged = SetupSettings::merge($stored, ['defaultUploadCount' => '3', 'defaultUploadKinds' => 'image,pdf', 'defaultStoreData' => 'false']);
        self::assertSame(['value' => '3', 'locked' => true], $merged['defaults']['props']['file']['count']);
        self::assertSame(['value' => '4', 'locked' => false], $merged['defaults']['props']['file']['source']);
        self::assertSame(['image', 'pdf'], $merged['defaults']['props']['file']['fileKinds']['value']);
        self::assertFalse($merged['defaults']['settings']['dataStorage']['storeData']['value']);
        self::assertTrue($merged['defaults']['settings']['processing']['ajax']['value']);
        self::assertSame('keep', $merged['queuePingToken']);
    }

    public function testNestedPhpOverridesAreLockedWithoutLockingSiblingDefaults(): void
    {
        $settings = $this->settings();
        $locked = SetupSettings::locked($settings, ['defaults' => ['props' => ['file' => ['count' => ['value' => '5']]]]]);
        self::assertContains('defaultUploadCount', $locked);
        self::assertNotContains('defaultUploadSize', $locked);
        $parent = SetupSettings::locked($settings, ['defaults' => false]);
        self::assertContains('defaultUploadCount', $parent);
        self::assertContains('defaultStoreData', $parent);
    }

    #[TestWith([['clientDigestFrequency' => '7']])]
    #[TestWith([['defaultUploadCount' => '0']])]
    #[TestWith([['defaultUploadSize' => '-5']])]
    #[TestWith([['defaultUploadKinds' => 'executable']])]
    #[TestWith([['alertNotificationRecipients' => 'not-an-email']])]
    public function testNewSettingValidationRejectsUnsupportedValues(array $changes): void
    {
        $values = SetupSettings::values($this->settings());
        $this->expectException(\InvalidArgumentException::class);
        SetupSettings::changes($changes, $values, $values, []);
    }

    private function settings(): Settings
    {
        $settings = (new \ReflectionClass(Settings::class))->newInstanceWithoutConstructor();
        $settings->defaultFromEmail = 'admin@example.com';
        $settings->defaultFromName = 'My site';

        return $settings;
    }
}
