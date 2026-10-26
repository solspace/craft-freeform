<?php

namespace Solspace\Freeform\Tests\Form\Settings;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Form\Settings\Implementations\GeneralSettings;

#[CoversClass(GeneralSettings::class)]
class GeneralBackgroundTest extends TestCase
{
    public function testBackgroundIsOptInAndConstrained(): void
    {
        $settings = new GeneralSettings();
        self::assertNull($settings->getBackgroundColor());
        $settings->customizeBackground = true;
        self::assertSame('#ffffff', $settings->getBackgroundColor());
        foreach (['#abc', '#003061', 'transparent'] as $color) {
            $settings->backgroundColor = $color;
            self::assertSame($color, $settings->getBackgroundColor());
        }
        foreach (['red; color: white', 'url(https://example.test)', '#abcd', ''] as $color) {
            $settings->backgroundColor = $color;
            self::assertNull($settings->getBackgroundColor());
        }
        $settings->backgroundColor = '#003061';
        $settings->customizeBackground = false;
        self::assertNull($settings->getBackgroundColor());
    }

    public function testComponentDesignValuesAreConstrained(): void
    {
        $settings = new GeneralSettings();
        self::assertSame('#6d28d9', $settings->getComponentDesign()['accent']);
        $settings->componentAccentColor = 'red;position:fixed';
        $settings->componentSurfaceColor = '#abc';
        $settings->componentSpacing = 'giant';
        $settings->componentCorners = 'round; color:red';
        self::assertSame('#6d28d9', $settings->getComponentDesign()['accent']);
        self::assertSame('#abc', $settings->getComponentDesign()['surface']);
        self::assertSame('comfortable', $settings->getComponentDesign()['spacing']);
        self::assertSame('soft', $settings->getComponentDesign()['corners']);
    }
}
