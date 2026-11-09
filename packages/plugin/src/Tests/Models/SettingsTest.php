<?php

namespace Solspace\Freeform\Tests\Models;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Models\Settings;

#[CoversClass(Settings::class)]
class SettingsTest extends TestCase
{
    public function testLoggingStylesPreservePreferencesWhileEnablingOnlyTheSelectedSystem(): void
    {
        $settings = $this->normalize(['activityEnabled' => 'true', 'technicalFileLogging' => 'true', 'loggingLevel' => 'debug', 'activityMode' => 'custom']);
        self::assertTrue($settings->isActivityLoggingEnabled());
        self::assertFalse($settings->isClassicLoggingEnabled());
        $settings->loggingStyle = 'classic';
        self::assertFalse($settings->isActivityLoggingEnabled());
        self::assertTrue($settings->isClassicLoggingEnabled());
        $settings->loggingStyle = 'activity';
        self::assertTrue($settings->isActivityLoggingEnabled());
        self::assertSame('debug', $settings->loggingLevel);
        self::assertSame('custom', $settings->activityMode);
        self::assertSame('1', $settings->technicalFileLogging);
        $settings->loggingStyle = 'none';
        self::assertTrue($settings->validate(['loggingStyle']));
        self::assertFalse($settings->isActivityLoggingEnabled());
        self::assertFalse($settings->isClassicLoggingEnabled());
        self::assertSame('none', $settings->getEffectiveLoggingStyle());
        self::assertSame('debug', $settings->loggingLevel);
        self::assertSame('custom', $settings->activityMode);
        $settings->loggingStyle = 'unknown';
        self::assertFalse($settings->validate(['loggingStyle']));
    }

    public function testPreviouslyDisabledLoggingShowsNoneUntilAStyleIsChosen(): void
    {
        $settings = $this->normalize(['activityEnabled' => 'false']);
        self::assertSame('none', $settings->getEffectiveLoggingStyle());
        $settings->setAttributes(['loggingStyle' => 'classic', 'activityEnabled' => '1', 'technicalFileLogging' => '1'], false);
        self::assertSame('classic', $settings->getEffectiveLoggingStyle());
    }

    public function testUploadVolumeSettingAcceptsAllNoneOrHandlesAndNormalizesClearedCheckboxes(): void
    {
        foreach (['*', 'none', [], ['forms'], ['forms', 'privateUploads']] as $value) {
            $settings = $this->normalize(['allowedUploadVolumes' => $value]);
            self::assertTrue($settings->validate(['allowedUploadVolumes']));
        }
        foreach (['forms', ['*'], [''], [1], [['forms']]] as $value) {
            $settings = $this->normalize(['allowedUploadVolumes' => $value]);
            self::assertFalse($settings->validate(['allowedUploadVolumes']));
        }
        $settings = $this->normalize([]);
        foreach (['', []] as $value) {
            $settings->setAttributes(['allowedUploadVolumes' => $value], false);
            self::assertSame('none', $settings->allowedUploadVolumes);
            self::assertTrue($settings->validate(['allowedUploadVolumes']));
        }
    }

    public function testFormCreationOptionsDefaultToAllAndPreserveTheirDisplayOrder(): void
    {
        $settings = $this->normalize([]);
        self::assertSame(['wizard', 'ai', 'blank'], $settings->getEnabledFormCreationOptions());
        $settings->formCreationOptions = ['blank', 'wizard', 'wizard'];
        self::assertSame(['wizard', 'blank'], $settings->getEnabledFormCreationOptions());
        $settings->formCreationOptions = ['ai'];
        self::assertSame(['ai'], $settings->getEnabledFormCreationOptions());
    }

    public function testFormCreationOptionsRejectEmptyAndUnknownChoices(): void
    {
        foreach (['', [], ['unknown'], ['wizard', 'unknown']] as $value) {
            $settings = $this->normalize(['formCreationOptions' => $value]);
            $settings->validate(['formCreationOptions']);
            self::assertTrue($settings->hasErrors('formCreationOptions'));
        }
    }

    public function testDefaultBooleanStringsAreNormalized(): void
    {
        $settings = $this->normalize([]);

        $this->assertSame('0', $settings->sitesEnabled);
        $this->assertSame('0', $settings->allowDashesInFieldHandles);
        $this->assertSame('0', $settings->exportTrackedUrlParameters);
        $this->assertSame('1', $settings->abTests);
        $this->assertSame('1', $settings->formSubmitDisable);
    }

    public function testStoredBooleanStringsAreNormalized(): void
    {
        $settings = $this->normalize([
            'sitesEnabled' => 'false',
            'abTests' => 'TRUE',
            'useIdempotencyKey' => 'False',
        ]);

        $this->assertSame('0', $settings->sitesEnabled);
        $this->assertSame('1', $settings->abTests);
        $this->assertSame('0', $settings->useIdempotencyKey);
    }

    public function testOtherValuesAreLeftUntouched(): void
    {
        $settings = $this->normalize([
            'sitesEnabled' => '$FREEFORM_SITES_ENABLED',
            'useQueueForEmailNotifications' => '1',
            'removeNewlines' => '',
            'pluginName' => 'false',
        ]);

        $this->assertSame('$FREEFORM_SITES_ENABLED', $settings->sitesEnabled);
        $this->assertSame('1', $settings->useQueueForEmailNotifications);
        $this->assertSame('', $settings->removeNewlines);
        $this->assertSame('false', $settings->pluginName);
    }

    /**
     * The full constructor builds form builder defaults that need a Craft app,
     * so create the model without it and run the normalization directly.
     */
    private function normalize(array $values): Settings
    {
        $reflection = new \ReflectionClass(Settings::class);
        $settings = $reflection->newInstanceWithoutConstructor();

        foreach ($values as $property => $value) {
            $settings->{$property} = $value;
        }

        $reflection->getMethod('normalizeBooleanStrings')->invoke($settings);

        return $settings;
    }
}
