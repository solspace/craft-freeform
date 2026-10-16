<?php

namespace Solspace\Freeform\Tests\Models;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Models\Settings;

#[CoversClass(Settings::class)]
class SettingsTest extends TestCase
{
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
