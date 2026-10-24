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
}
