<?php

namespace Solspace\Freeform\Tests\Models;

use Illuminate\Contracts\Validation\Factory as ValidationFactory;
use Illuminate\Events\Dispatcher;
use Illuminate\Translation\ArrayLoader;
use Illuminate\Translation\Translator;
use Illuminate\Validation\Factory;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\Defaults;
use Solspace\Freeform\Models\Settings;
use Solspace\Freeform\Tests\Helpers\UsesCraft6Container;

#[CoversClass(Settings::class)]
class SettingsTest extends TestCase
{
    use UsesCraft6Container;

    protected function setUp(): void
    {
        app()->instance('events', new Dispatcher(app()));
        app()->instance(ValidationFactory::class, new Factory(new Translator(new ArrayLoader(), 'en'), app()));
    }

    public function testClassicSettingsUpgradeToActivityAndDiscardRetiredOptions(): void
    {
        foreach (['true', 'false', '$FREEFORM_FILE_LOGGING'] as $guard) {
            $values = ['loggingStyle' => 'classic', 'activityEnabled' => 'false', 'technicalFileLogging' => $guard, 'loggingLevel' => 'debug', 'activityMode' => 'custom', 'activityEvents' => ['submission' => false], 'activityRetentionDays' => 7];
            $settings = $this->normalize([]);
            $settings->setAttributes($values, false);
            self::assertSame('activity', $settings->loggingStyle);
            self::assertSame('activity', $settings->getEffectiveLoggingStyle());
            self::assertTrue($settings->isActivityLoggingEnabled());
            self::assertTrue($settings->validate(['loggingStyle']));
            self::assertSame('custom', $settings->activityMode);
            self::assertSame(['submission' => false], $settings->activityEvents);
            self::assertSame(7, $settings->activityRetentionDays);
            self::assertArrayNotHasKey('loggingLevel', $settings->toArray());
            self::assertArrayNotHasKey('technicalFileLogging', $settings->toArray());
        }
    }

    public function testDisabledLoggingStaysOffUntilActivityIsChosen(): void
    {
        $settings = $this->normalize(['activityEnabled' => 'false']);
        self::assertSame('none', $settings->getEffectiveLoggingStyle());
        $settings->setAttributes(['loggingStyle' => 'none', 'technicalFileLogging' => 'true', 'loggingLevel' => 'debug'], false);
        self::assertSame('none', $settings->getEffectiveLoggingStyle());
        $settings->setAttributes(['loggingStyle' => 'activity', 'activityEnabled' => '1'], false);
        self::assertSame('activity', $settings->getEffectiveLoggingStyle());
        $settings->loggingStyle = 'unknown';
        self::assertFalse($settings->validate(['loggingStyle']));
    }

    public function testRetiredSettingsDoNotDiscardExistingPayloadKeys(): void
    {
        $settings = new Settings(['sessionContextSecret' => 'existing-payload-key', 'loggingStyle' => 'classic', 'scriptInsertType' => 'inline', 'scriptInsertLocation' => 'header']);
        self::assertSame('activity', $settings->getEffectiveLoggingStyle());
        self::assertSame('footer', $settings->scriptInsertLocation);
        self::assertSame('existing-payload-key', $settings->sessionContextSecret);
        $settings->setAttributes(['scriptInsertLocation' => 'form'], false);
        self::assertSame('existing-payload-key', $settings->sessionContextSecret);
        self::assertSame('existing-payload-key', $settings->toArray()['sessionContextSecret']);
    }

    public function testRetainedScrollSettingWinsOverTheRemovedAjaxPreference(): void
    {
        foreach (['true', 'false', '$FREEFORM_SCROLL'] as $retained) {
            foreach (['true', 'false'] as $retired) {
                $settings = new Settings(['autoScrollToErrors' => $retained, 'autoScroll' => $retired]);
                self::assertSame($retained === 'true' ? '1' : ($retained === 'false' ? '0' : $retained), $settings->autoScrollToErrors);
                self::assertArrayNotHasKey('autoScroll', $settings->toArray());
            }
        }
    }

    public function testRetiredScriptSettingsNormalizeWithoutOverridingSupportedLocations(): void
    {
        foreach (['header' => 'footer', 'footer' => 'footer', 'form' => 'form', 'manual' => 'manual'] as $legacy => $expected) {
            $settings = $this->normalize([]);
            $settings->setAttributes(['scriptInsertType' => 'inline', 'scriptInsertLocation' => $legacy], false);
            self::assertSame($expected, $settings->scriptInsertLocation);
            self::assertTrue($settings->validate(['scriptInsertLocation']));
            self::assertArrayNotHasKey('scriptInsertType', $settings->toArray());
        }
        $settings->scriptInsertLocation = 'unknown';
        self::assertFalse($settings->validate(['scriptInsertLocation']));
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
            self::assertTrue($settings->errors()->has('formCreationOptions'));
        }
    }

    public function testDefaultBooleanStringsAreNormalized(): void
    {
        $settings = $this->normalize([]);

        $this->assertSame('0', $settings->sitesEnabled);
        $this->assertSame('0', $settings->allowDashesInFieldHandles);
        $this->assertSame('1', $settings->abTests);
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
            'useQueue' => '1',
            'pluginName' => 'false',
        ]);

        $this->assertSame('$FREEFORM_SITES_ENABLED', $settings->sitesEnabled);
        $this->assertSame('1', $settings->useQueue);
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
        $settings->defaults = new Defaults();

        foreach ($values as $property => $value) {
            $settings->{$property} = $value;
        }

        $reflection->getMethod('normalizeBooleanStrings')->invoke($settings);

        return $settings;
    }
}
