<?php

namespace Solspace\Freeform\Tests\Fields;

use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Fields\Implementations\CalloutField;
use Solspace\Freeform\Fields\Implementations\ContentField;
use Solspace\Freeform\Fields\Implementations\DividerField;
use Solspace\Freeform\Fields\Implementations\HeadingField;
use Solspace\Freeform\Fields\Implementations\Pro\ImageField;
use Solspace\Freeform\Fields\Implementations\Pro\LayoutField;
use Solspace\Freeform\Fields\Implementations\SpacerField;
use Solspace\Freeform\Fields\Interfaces\NoStorageInterface;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Translations\TranslationTable;

/**
 * @coversNothing
 */
class ContentFieldsTest extends TestCase
{
    public function testCardAppearanceIsOptInAndSupportsLargerSets(): void
    {
        $field = new LayoutField($this->createMock(Form::class));
        self::assertSame([], $field->getCardStyle());
        foreach (['columnStyle' => 'cards', 'cardBorderWidth' => 0, 'cardRadius' => 500, 'cardPadding' => 'none', 'cardBackgroundColor' => 'red; position:fixed'] as $key => $value) {
            (new \ReflectionProperty(LayoutField::class, $key))->setValue($field, $value);
        }
        self::assertSame('0px', $field->getCardStyle()['--freeform-card-border-width']);
        self::assertSame('64px', $field->getCardStyle()['--freeform-card-radius']);
        self::assertSame('0px', $field->getCardStyle()['--freeform-card-padding']);
        self::assertSame('#ffffff', $field->getCardStyle()['--freeform-card-background']);
        foreach (['four' => 4, 'five' => 5, 'six' => 6] as $preset => $count) {
            (new \ReflectionProperty(LayoutField::class, 'preset'))->setValue($field, $preset);
            self::assertSame("repeat({$count}, minmax(0, 1fr))", $field->getColumnWidths());
        }
    }

    public function testCardDimensionPresetsPreserveCustomAndLegacyValues(): void
    {
        $field = new LayoutField($this->createMock(Form::class));
        foreach (['columnStyle' => 'cards', 'cardBorderWidth' => 5, 'cardRadius' => 17] as $key => $value) {
            (new \ReflectionProperty(LayoutField::class, $key))->setValue($field, $value);
        }
        self::assertSame('5px', $field->getCardStyle()['--freeform-card-border-width']);
        self::assertSame('17px', $field->getCardStyle()['--freeform-card-radius']);
        foreach (['none' => 0, 'one' => 1, 'two' => 2, 'three' => 3, 'custom' => 5, 'unknown' => 5] as $preset => $width) {
            (new \ReflectionProperty(LayoutField::class, 'cardBorderWidthPreset'))->setValue($field, $preset);
            self::assertSame($width.'px', $field->getCardStyle()['--freeform-card-border-width']);
        }
        foreach (['three' => 3, 'five' => 5, 'ten' => 10, 'fifteen' => 15, 'twenty' => 20, 'square' => 0, 'small' => 4, 'medium' => 8, 'rounded' => 12, 'large' => 24, 'custom' => 17, 'unknown' => 17] as $preset => $radius) {
            (new \ReflectionProperty(LayoutField::class, 'cardRadiusPreset'))->setValue($field, $preset);
            self::assertSame($radius.'px', $field->getCardStyle()['--freeform-card-radius']);
        }
    }

    public function testCardBorderCanBeNoneWithoutChangingItsDimensions(): void
    {
        $field = new LayoutField($this->createMock(Form::class));
        foreach (['columnStyle' => 'cards', 'cardRadiusPreset' => 'five', 'cardBorderWidthPreset' => 'three'] as $key => $value) {
            (new \ReflectionProperty(LayoutField::class, $key))->setValue($field, $value);
        }
        foreach (['transparent', 'rgba(0,0,0,0)'] as $color) {
            (new \ReflectionProperty(LayoutField::class, 'cardBorderColor'))->setValue($field, $color);
            self::assertSame('transparent', $field->getCardStyle()['--freeform-card-border-color']);
            self::assertSame('3px', $field->getCardStyle()['--freeform-card-border-width']);
            self::assertSame('5px', $field->getCardStyle()['--freeform-card-radius']);
        }
    }

    public function testHeadingsEscapeTextAndConstrainMarkup(): void
    {
        $field = $this->field(HeadingField::class, ['content' => '<script>alert(1)</script>', 'level' => 'script', 'alignment' => 'left; color: red']);
        $html = $this->html($field);
        self::assertStringStartsWith('<h2', $html);
        self::assertStringContainsString('&lt;script&gt;', $html);
        self::assertStringNotContainsString('color: red', $html);
        self::assertStringNotContainsString('<script>', $html);
    }

    public function testCalloutsRenderTranslationsAndEscapeMarkup(): void
    {
        $field = $this->field(CalloutField::class, ['content' => 'Original', 'appearance' => 'info'], ['content' => "Translated <img src=x>\nSecond line"]);
        self::assertStringContainsString('Translated &lt;img src=x&gt;', $this->html($field));
        self::assertStringContainsString('<br', $this->html($field));
        self::assertInstanceOf(NoStorageInterface::class, $field);
        self::assertFalse($field->includeInGqlSchema());
    }

    public function testCalloutsRenderRichTextAndParagraphAlignment(): void
    {
        $field = $this->field(CalloutField::class, ['content' => 'Old text', 'richContent' => '<p style="text-align: right;"><strong>Important</strong> <a href="https://example.test">Read more</a></p><ul><li>One</li><li>Two</li></ul>']);
        $html = $this->html($field);
        self::assertStringContainsString('<strong>Important</strong>', $html);
        self::assertStringContainsString('<ul><li>One</li><li>Two</li></ul>', $html);
        self::assertStringContainsString('text-align: right', $html);
        self::assertStringNotContainsString('Old text', $html);
        (new \ReflectionProperty(CalloutField::class, 'richContent'))->setValue($field, '');
        self::assertStringNotContainsString('Old text', $this->html($field));
    }

    public function testCalloutsSupportSuccessAndDangerAppearances(): void
    {
        foreach (['success' => '#15803d', 'warning' => '#d97706', 'danger' => '#b91c1c'] as $appearance => $color) {
            $html = $this->html($this->field(CalloutField::class, ['appearance' => $appearance, 'content' => 'A note']));
            self::assertStringContainsString('freeform-callout-'.$appearance, $html);
            self::assertStringContainsString('3px solid '.$color, $html);
            self::assertStringContainsString('color-mix(in srgb, '.$color.' 8%, transparent)', $html);
        }
    }

    public function testCalloutsPreserveOldLocaleTextUntilRichTranslationIsEdited(): void
    {
        $field = $this->field(CalloutField::class, ['richContent' => '<p>New default</p>'], ['content' => "Old <strong>literal</strong>\nSecond line"]);
        self::assertStringContainsString('&lt;strong&gt;literal&lt;/strong&gt;', $this->html($field));
        self::assertStringContainsString('<br', $this->html($field));
        $field = $this->field(CalloutField::class, ['richContent' => '<p>New default</p>'], ['content' => 'Old locale', 'richContent' => '<p><em>Translated</em></p>']);
        self::assertStringContainsString('<em>Translated</em>', $this->html($field));
        self::assertStringNotContainsString('Old locale', $this->html($field));
    }

    public function testHeadingSizeIsIndependentOfItsLevelAndPreservesTemplateDefaults(): void
    {
        $field = $this->field(HeadingField::class, ['content' => 'A large heading', 'level' => 'h2']);
        self::assertStringNotContainsString('font-size', $this->html($field));
        (new \ReflectionProperty(HeadingField::class, 'textSize'))->setValue($field, 'display');
        self::assertStringStartsWith('<h2', $this->html($field));
        self::assertStringContainsString('clamp(24px, 8vw, 64px)', $this->html($field));
        (new \ReflectionProperty(HeadingField::class, 'textSize'))->setValue($field, 'custom');
        (new \ReflectionProperty(HeadingField::class, 'fontSize'))->setValue($field, 500);
        self::assertStringContainsString('200px', $this->html($field));
    }

    public function testHeadingLevelsFiveAndSixRenderWithoutChangingTheirVisualSize(): void
    {
        foreach (['h5', 'h6'] as $level) {
            $html = $this->html($this->field(HeadingField::class, ['content' => 'Section heading', 'level' => $level, 'textSize' => 'large']));
            self::assertStringStartsWith('<'.$level, $html);
            self::assertStringContainsString('48px', $html);
        }
    }

    public function testSpacersPreserveZeroAndClampCustomHeight(): void
    {
        $field = $this->field(SpacerField::class, ['spacing' => 'custom', 'height' => 0]);
        self::assertSame(0, $field->getHeight());
        self::assertStringContainsString('height: 0px', $this->html($field));
        (new \ReflectionProperty(SpacerField::class, 'height'))->setValue($field, 5000);
        self::assertSame(1000, $field->getHeight());
        (new \ReflectionProperty(SpacerField::class, 'spacing'))->setValue($field, 'large');
        self::assertSame(64, $field->getHeight());
    }

    public function testDividersConstrainStylesAndSpacing(): void
    {
        $field = $this->field(DividerField::class, ['lineStyle' => 'dashed; color: red', 'spacing' => 'invalid']);
        self::assertStringContainsString('1px solid currentColor', $this->html($field));
        self::assertStringContainsString('margin: 16px 0', $this->html($field));
        self::assertStringContainsString('opacity: .25', $this->html($field));
        $custom = $this->field(DividerField::class, ['lineStyle' => 'dotted', 'lineColor' => '#2563eb', 'thickness' => 4]);
        self::assertStringContainsString('4px dotted #2563eb', $this->html($custom));
        self::assertStringContainsString('opacity: 1', $this->html($custom));
        $invalid = $this->field(DividerField::class, ['lineColor' => 'red;position:fixed', 'thickness' => 99]);
        self::assertStringContainsString('20px solid currentColor', $this->html($invalid));
        self::assertStringNotContainsString('position:fixed', $this->html($invalid));
        foreach (['one' => 1, 'two' => 2, 'three' => 3, 'five' => 5, 'custom' => 4] as $preset => $weight) {
            $presetField = $this->field(DividerField::class, ['thicknessPreset' => $preset, 'thickness' => 4]);
            self::assertSame($weight, $presetField->getThickness());
            self::assertStringContainsString($weight.'px solid currentColor', $this->html($presetField));
        }
    }

    public function testLayoutPresentationValuesAreConstrained(): void
    {
        $field = new LayoutField($this->createMock(Form::class));
        foreach (['preset' => 'wide', 'gap' => 'large', 'mobile' => 'keep'] as $key => $value) {
            (new \ReflectionProperty(LayoutField::class, $key))->setValue($field, $value);
        }
        self::assertSame('2fr 1fr', $field->getColumnWidths());
        self::assertSame(32, $field->getGap());
        self::assertFalse($field->isStackedOnMobile());
        (new \ReflectionProperty(LayoutField::class, 'preset'))->setValue($field, 'invalid');
        self::assertSame('1fr 1fr', $field->getColumnWidths());
        (new \ReflectionProperty(LayoutField::class, 'preset'))->setValue($field, 'one');
        self::assertSame('1fr', $field->getColumnWidths());
        (new \ReflectionProperty(LayoutField::class, 'verticalAlignment'))->setValue($field, 'middle');
        self::assertSame('center', $field->getVerticalAlignment());
        (new \ReflectionProperty(LayoutField::class, 'verticalAlignment'))->setValue($field, 'invalid');
        self::assertSame('flex-start', $field->getVerticalAlignment());
    }

    public function testImageDisplayIsOptInAndConstrainedWithoutChangingTheAsset(): void
    {
        $field = new ImageField($this->createMock(Form::class));
        self::assertSame([], $field->getDisplayStyles());
        foreach (['customizeDisplay' => true, 'displayWidth' => 280, 'aspectRatio' => 'square', 'imageFit' => 'cover', 'cropPosition' => 'top'] as $key => $value) {
            (new \ReflectionProperty(ImageField::class, $key))->setValue($field, $value);
        }
        self::assertSame(['display' => 'block', 'width' => '280px', 'max-width' => '100%', 'height' => 'auto', 'aspect-ratio' => '1 / 1', 'object-fit' => 'cover', 'object-position' => 'top'], $field->getDisplayStyles());
        self::assertSame([], $field->getAssetId());
        foreach (['top-left' => 'left top', 'top-right' => 'right top', 'bottom-left' => 'left bottom', 'bottom-right' => 'right bottom'] as $position => $expected) {
            (new \ReflectionProperty(ImageField::class, 'cropPosition'))->setValue($field, $position);
            self::assertSame($expected, $field->getDisplayStyles()['object-position']);
        }
        (new \ReflectionProperty(ImageField::class, 'aspectRatio'))->setValue($field, 'invalid');
        self::assertArrayNotHasKey('aspect-ratio', $field->getDisplayStyles());
        (new \ReflectionProperty(ImageField::class, 'customizeDisplay'))->setValue($field, false);
        self::assertSame([], $field->getDisplayStyles());
    }

    public function testSectionBackgroundDefaultsAndColorValues(): void
    {
        $field = new LayoutField($this->createMock(Form::class));
        self::assertSame([], $field->getAppearanceStyle());
        foreach (['background' => 'color', 'backgroundColor' => '#abc', 'textColor' => 'red;position:fixed', 'padding' => 'none', 'minHeight' => 5000] as $key => $value) {
            (new \ReflectionProperty(LayoutField::class, $key))->setValue($field, $value);
        }
        self::assertSame('#abc', $field->getAppearanceStyle()['--freeform-background-color']);
        self::assertSame('#334155', $field->getAppearanceStyle()['--freeform-text-color']);
        self::assertSame('0px', $field->getAppearanceStyle()['--freeform-padding']);
        self::assertSame('1000px', $field->getAppearanceStyle()['--freeform-min-height']);
    }

    public function testSectionImageOverlayQuotesAssetUrlsAndPreservesZeroOpacity(): void
    {
        $field = $this->getMockBuilder(LayoutField::class)->setConstructorArgs([$this->createMock(Form::class)])->onlyMethods(['getBackgroundImageUrl'])->getMock();
        $field->method('getBackgroundImageUrl')->willReturn('https://example.test/a"b.png');
        foreach (['background' => 'image', 'overlayColor' => '#abc', 'overlayOpacity' => 0] as $key => $value) {
            (new \ReflectionProperty(LayoutField::class, $key))->setValue($field, $value);
        }
        self::assertSame('linear-gradient(rgba(170, 187, 204, 0), rgba(170, 187, 204, 0)), url("https://example.test/a\"b.png")', $field->getAppearanceStyle()['--freeform-background-image']);
        self::assertStringNotContainsString('position', $field->getLayoutStyle());
    }

    public function testOverlayPresetsAndTransparentColorPreserveLegacyOpacity(): void
    {
        $field = $this->getMockBuilder(LayoutField::class)->setConstructorArgs([$this->createMock(Form::class)])->onlyMethods(['getBackgroundImageUrl'])->getMock();
        $field->method('getBackgroundImageUrl')->willReturn('image.png');
        self::assertSame(45, $field->getOverlayOpacity());
        foreach (['light' => 10, 'quarter' => 25, 'half' => 50, 'strong' => 75, 'custom' => 45] as $preset => $opacity) {
            (new \ReflectionProperty(LayoutField::class, 'overlayOpacityPreset'))->setValue($field, $preset);
            self::assertSame($opacity, $field->getOverlayOpacity());
        }
        foreach (['background' => 'image', 'overlayColor' => 'transparent', 'overlayOpacityPreset' => 'strong'] as $key => $value) {
            (new \ReflectionProperty(LayoutField::class, $key))->setValue($field, $value);
        }
        self::assertSame('linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0)), url("image.png")', $field->getAppearanceStyle()['--freeform-background-image']);
    }

    private function field(string $class, array $properties, array $translations = []): ContentField
    {
        $field = $this->getMockBuilder($class)->setConstructorArgs([$this->createMock(Form::class)])->onlyMethods(['getTranslationTable'])->getMock();
        $field->method('getTranslationTable')->willReturn(new TranslationTable($translations));
        foreach ($properties as $key => $value) {
            (new \ReflectionProperty($class, $key))->setValue($field, $value);
        }

        return $field;
    }

    private function html(ContentField $field): string
    {
        return (new \ReflectionMethod($field, 'getInputHtml'))->invoke($field);
    }
}
