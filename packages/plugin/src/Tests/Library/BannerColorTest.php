<?php

namespace Solspace\Freeform\Tests\Library;

use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Bundles\Attributes\Property\PropertyProvider;
use Solspace\Freeform\Bundles\Fields\ImplementationProvider;
use Solspace\Freeform\Bundles\Form\Limiting\LimitedUsers\LimitedUserChecker;
use Solspace\Freeform\Bundles\Settings\DefaultsProvider;
use Solspace\Freeform\Form\Settings\Settings;
use Solspace\Freeform\Library\Attributes\Attributes;
use Solspace\Freeform\Library\Helpers\BannerColorHelper;
use Solspace\Freeform\Library\Helpers\ColorHelper;
use yii\di\Container;

/**
 * @coversNothing
 */
class BannerColorTest extends TestCase
{
    private mixed $originalContainer;

    protected function setUp(): void
    {
        $this->originalContainer = \Craft::$container;
        \Craft::$container = new Container();
    }

    protected function tearDown(): void
    {
        \Craft::$container = $this->originalContainer;
    }

    public function testLegacyFormsRetainTemplateColorsAndNewFormsHaveGreenAndRedDefaults(): void
    {
        $properties = new PropertyProvider(
            $this->createMock(ImplementationProvider::class),
            $this->createMock(DefaultsProvider::class),
            $this->createMock(LimitedUserChecker::class),
        );
        $settings = (new Settings(['behavior' => ['successMessage' => 'Existing message']], $properties))->getBehavior();
        self::assertFalse($settings->customMessageColors);
        self::assertSame('#16a34a', $settings->successColor);
        self::assertSame('#dc2626', $settings->errorColor);
        self::assertSame('soft', $settings->bannerStyle);

        $settings = (new Settings(['behavior' => ['successColor' => '#2563eb', 'errorColor' => 'currentColor']], $properties))->getBehavior();
        self::assertTrue($settings->customMessageColors);
        self::assertSame('#2563eb', $settings->successColor);
        self::assertSame('#dc2626', $settings->errorColor);

        $settings = (new Settings(['behavior' => ['customMessageColors' => false, 'successColor' => '#2563eb', 'errorColor' => '#a855f7']], $properties))->getBehavior();
        self::assertFalse($settings->customMessageColors);
        self::assertSame('#2563eb', $settings->successColor);
        self::assertSame('#a855f7', $settings->errorColor);

        $settings = (new Settings(['behavior' => ['successColor' => 'currentColor', 'errorColor' => 'currentColor']], $properties))->getBehavior();
        self::assertFalse($settings->customMessageColors);
    }

    public function testOverridesPreserveOtherAttributesAndAreSharedWithAjax(): void
    {
        $attributes = new Attributes(['class' => 'alert alert-success', 'style' => 'padding:1rem;']);
        BannerColorHelper::apply($attributes, '#16a34a');
        $style = $attributes->get('style');
        self::assertStringStartsWith('padding:1rem;', $style);
        self::assertStringContainsString('border-color:#16a34a', (string) $attributes);
        self::assertSame($style, $attributes->toHtmlTagArray()['style']);
        self::assertTrue($attributes->toHtmlTagArray()['data-freeform-custom-banner-color']);
        self::assertStringContainsString('--ff-banner-text-color:', $style);
        self::assertSame('alert alert-success', $attributes->get('class'));
        BannerColorHelper::apply($attributes, '#16a34a');
        self::assertSame($style, $attributes->get('style'));
    }

    public function testInheritedAndInvalidValuesLeaveLegacyStylingUntouched(): void
    {
        foreach ([null, '', 'currentColor', 'inherit', 'red;display:none', '#nothex', 'url(https://example.test)'] as $color) {
            $attributes = new Attributes(['style' => 'color:var(--color-success)']);
            BannerColorHelper::apply($attributes, $color);
            self::assertSame('color:var(--color-success)', $attributes->get('style'));
        }
        self::assertSame(BannerColorHelper::style('#aabbcc'), BannerColorHelper::style('abc'));
    }

    public function testAllPaletteColorsProduceReadableBannerText(): void
    {
        foreach (ColorHelper::getPalette() as $color) {
            $style = BannerColorHelper::style($color['value']);
            preg_match('/background-color:(#[a-f0-9]{6});.*;color:(#[a-f0-9]{6})$/', $style, $matches);
            $contrast = ($this->luminance($matches[1]) + .05) / ($this->luminance($matches[2]) + .05);
            self::assertGreaterThanOrEqual(4.5, $contrast, $color['label']);
        }
    }

    public function testDarkBannerTintsStayReadableAcrossBundledDarkSurfaces(): void
    {
        foreach (ColorHelper::getPalette() as $color) {
            $colors = BannerColorHelper::colors($color['value'], true);
            self::assertSame($color['value'], $colors['border']);
            preg_match('/^rgba\((\d+),(\d+),(\d+),0\.18\)$/', $colors['background'], $matches);
            self::assertCount(4, $matches);
            foreach ([[17, 24, 39], [31, 41, 55], [33, 37, 41]] as $surface) {
                $background = '#';
                foreach ($surface as $index => $channel) {
                    $background .= str_pad(dechex((int) round((int) $matches[$index + 1] * .18 + $channel * .82)), 2, '0', \STR_PAD_LEFT);
                }
                $contrast = ($this->luminance($colors['text']) + .05) / ($this->luminance($background) + .05);
                self::assertGreaterThanOrEqual(4.5, $contrast, $color['label']);
            }
        }
    }

    public function testFieldColorsUseTheErrorHueAndPreserveOtherFormStyles(): void
    {
        $attributes = new Attributes(['style' => 'max-width:40rem']);
        BannerColorHelper::applyFieldColors($attributes, '#8b5cf6');
        self::assertTrue($attributes->get('data-freeform-custom-error-color'));
        self::assertStringContainsString('max-width:40rem;--ff-error-color:#8b5cf6;', $attributes->get('style'));
        self::assertStringContainsString('--ff-error-text-color:'.BannerColorHelper::colors('#8b5cf6')['text'], $attributes->get('style'));
        self::assertStringContainsString('--color-error:#8b5cf6', $attributes->get('style'));
        $style = $attributes->get('style');
        BannerColorHelper::applyFieldColors($attributes, '#8b5cf6');
        self::assertSame($style, $attributes->get('style'));

        $attributes = new Attributes();
        BannerColorHelper::applyFieldColors($attributes, 'currentColor');
        self::assertNull($attributes->get('data-freeform-custom-error-color'));
        self::assertNull($attributes->get('style'));
    }

    public function testBoldBannersKeepTheSelectedColorAndUseContrastingText(): void
    {
        foreach (ColorHelper::getPalette() as $color) {
            foreach ([false, true] as $dark) {
                $colors = BannerColorHelper::colors($color['value'], $dark, 'bold');
                self::assertSame($color['value'], $colors['background']);
                self::assertSame($color['value'], $colors['border']);
                $first = $this->luminance($colors['text']);
                $second = $this->luminance($colors['background']);
                self::assertGreaterThanOrEqual(4.5, (max($first, $second) + .05) / (min($first, $second) + .05));
            }
        }
        self::assertSame(BannerColorHelper::style('#dc2626'), BannerColorHelper::style('#dc2626', false, 'unknown'));
    }

    private function luminance(string $hex): float
    {
        $rgb = array_map(static function (string $hex): float {
            $value = hexdec($hex) / 255;

            return $value <= .04045 ? $value / 12.92 : (($value + .055) / 1.055) ** 2.4;
        }, str_split(substr($hex, 1), 2));

        return $rgb[0] * .2126 + $rgb[1] * .7152 + $rgb[2] * .0722;
    }
}
