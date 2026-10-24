<?php

namespace Solspace\Freeform\Tests\Fields;

use PHPUnit\Framework\Attributes\CoversNothing;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Fields\Implementations\ButtonLinkField;
use Solspace\Freeform\Fields\Implementations\ContentField;
use Solspace\Freeform\Fields\Implementations\IconField;
use Solspace\Freeform\Fields\Implementations\Pro\LayoutField;
use Solspace\Freeform\Fields\Implementations\VideoField;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Translations\TranslationTable;
use Solspace\Freeform\Services\Headless\Manifest\ManifestExtensionResolver;

#[CoversNothing]
class AdditionalContentFieldsTest extends TestCase
{
    public function testHeadlessContentUsesTheHtmlRenderer(): void
    {
        $resolver = new ManifestExtensionResolver();
        foreach (['button-link', 'video', 'icon'] as $type) {
            self::assertSame('html', $resolver->resolveRenderer($type));
        }
    }

    #[TestWith(['javascript:alert(1)'])]
    #[TestWith(['data:text/html,x'])]
    #[TestWith(['//example.test'])]
    #[TestWith(["java\nscript:alert(1)"])]
    #[TestWith(['/\example.test'])]
    public function testRejectsUnsafeLinkDestinations(string $url): void
    {
        self::assertSame('#', $this->field(ButtonLinkField::class, ['url' => $url])->getUrl());
    }

    #[TestWith(['/contact'])]
    #[TestWith(['https://example.test/next'])]
    #[TestWith(['mailto:hello@example.test'])]
    #[TestWith(['tel:+15550101234'])]
    public function testRendersAnEditableAccessibleLinkWithoutASubmitButton(string $url): void
    {
        $html = $this->html($this->field(ButtonLinkField::class, ['url' => $url, 'linkText' => '<Click here>', 'newTab' => true, 'alignment' => 'center', 'appearance' => 'outline']));
        self::assertStringContainsString('href="'.$url.'"', $html);
        self::assertStringContainsString('&lt;Click here&gt;', $html);
        self::assertStringContainsString('rel="noopener noreferrer"', $html);
        self::assertStringContainsString('text-align: center', $html);
        self::assertStringContainsString('background: transparent', $html);
        self::assertStringNotContainsString('<button', $html);
    }

    #[TestWith(['https://youtu.be/dQw4w9WgXcQ', 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'])]
    #[TestWith(['https://youtube.com/watch?v=dQw4w9WgXcQ', 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'])]
    #[TestWith(['https://youtube.com/shorts/dQw4w9WgXcQ', 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'])]
    #[TestWith(['https://vimeo.com/123456789/abcdef1234', 'https://player.vimeo.com/video/123456789?h=abcdef1234'])]
    #[TestWith(['https://player.vimeo.com/video/123456789?h=abcdef1234', 'https://player.vimeo.com/video/123456789?h=abcdef1234'])]
    #[TestWith(['https://youtube.com.evil.test/watch?v=dQw4w9WgXcQ', null])]
    #[TestWith(['https://youtube.com/watch?v[]=dQw4w9WgXcQ', null])]
    #[TestWith(['http://youtu.be/dQw4w9WgXcQ', null])]
    #[TestWith(['https://user@youtu.be/dQw4w9WgXcQ', null])]
    #[TestWith(['https://youtu.be:8443/dQw4w9WgXcQ', null])]
    public function testVideoUrlsOnlyResolveToSupportedProviders(string $url, ?string $expected): void
    {
        self::assertSame($expected, $this->field(VideoField::class, ['url' => $url])->getEmbedUrl());
    }

    public function testVideoUsesATitledLazyPlayerAndPreviewRemainsOffline(): void
    {
        $properties = ['url' => 'https://youtu.be/dQw4w9WgXcQ', 'videoTitle' => 'Our <video>', 'aspectRatio' => 'square'];
        $html = $this->html($this->field(VideoField::class, $properties));
        self::assertStringContainsString('<iframe', $html);
        self::assertStringContainsString('title="Our &lt;video&gt;"', $html);
        self::assertStringContainsString('loading="lazy"', $html);
        self::assertStringContainsString('aspect-ratio: 1 / 1', $html);
        $preview = $this->html($this->field(VideoField::class, $properties, true));
        self::assertStringNotContainsString('<iframe', $preview);
        self::assertStringNotContainsString('youtube', $preview);
        self::assertStringContainsString('freeform-video-placeholder', $preview);
    }

    public function testVideoPlaybackOptionsKeepProviderUrlsAndPrivateHashesIntact(): void
    {
        $options = ['playback' => 'autoplay', 'playerControls' => 'hide', 'loopPlayback' => 'loop', 'startTime' => 30];
        $youtube = $this->field(VideoField::class, ['url' => 'https://youtu.be/dQw4w9WgXcQ', ...$options]);
        self::assertSame('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?controls=0&autoplay=1&mute=1&loop=1&playlist=dQw4w9WgXcQ&start=30', $youtube->getEmbedUrl());
        self::assertStringContainsString('allow="autoplay; fullscreen;', $this->html($youtube));
        self::assertSame('https://player.vimeo.com/video/123456789?h=abcdef1234&controls=0&autoplay=1&muted=1&loop=1#t=30s', $this->field(VideoField::class, ['url' => 'https://vimeo.com/123456789/abcdef1234', ...$options])->getEmbedUrl());
        self::assertStringNotContainsString('<iframe', $this->html($this->field(VideoField::class, ['url' => 'https://youtu.be/dQw4w9WgXcQ', ...$options], true)));
        self::assertSame('https://player.vimeo.com/video/123456789#t=86400s', $this->field(VideoField::class, ['url' => 'https://vimeo.com/123456789', 'startTime' => 999999])->getEmbedUrl());
        self::assertSame('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ', $this->field(VideoField::class, ['url' => 'https://youtu.be/dQw4w9WgXcQ', 'startTime' => -1])->getEmbedUrl());
    }

    public function testIconsHaveAnAccessibleOrDecorativeModeAndConstrainAppearance(): void
    {
        $html = $this->html($this->field(IconField::class, ['icon' => 'mail', 'accessibleText' => 'Email <us>', 'alignment' => 'right', 'iconSize' => 500, 'color' => 'red;position:fixed']));
        self::assertStringContainsString('role="img"', $html);
        self::assertStringContainsString('aria-label="Email &lt;us&gt;"', $html);
        self::assertStringContainsString('width="256"', $html);
        self::assertStringContainsString('justify-content: flex-end', $html);
        self::assertStringNotContainsString('position:fixed', $html);
        self::assertStringContainsString('aria-hidden="true"', $this->html($this->field(IconField::class, [])));
    }

    public function testVideoFrameSizingAndAlignmentApplyToPlayerAndPreview(): void
    {
        $properties = ['url' => 'https://youtu.be/dQw4w9WgXcQ', 'alignment' => 'center', 'maximumWidth' => 420, 'aspectRatio' => 'portrait'];
        foreach ([false, true] as $preview) {
            $html = $this->html($this->field(VideoField::class, $properties, $preview));
            self::assertStringContainsString('max-width: 420px', $html);
            self::assertStringContainsString('margin-left: auto', $html);
            self::assertStringContainsString('margin-right: auto', $html);
            self::assertStringContainsString('aspect-ratio: 9 / 16', $html);
        }
        self::assertStringContainsString('max-width:100%', $this->field(VideoField::class, [])->getFrameStyle());
    }

    public function testLayoutProportionsAreOptionalAndCannotInjectCss(): void
    {
        $field = new LayoutField($this->createMock(Form::class));
        (new \ReflectionProperty(LayoutField::class, 'preset'))->setValue($field, 'sidebar');
        self::assertSame('1fr 2fr 1fr', $field->getColumnWidths());
        (new \ReflectionProperty(LayoutField::class, 'columnProportions'))->setValue($field, '1, 2.5, .5');
        self::assertSame('minmax(0, 1fr) minmax(0, 2.5fr) minmax(0, 0.5fr)', $field->getColumnWidths());
        foreach (['', '1,2', '0,2,1', '-1,2,1', '101,1,1', '0.01,1,1', '1fr 2fr 1fr', '1;position:fixed,2,1'] as $input) {
            (new \ReflectionProperty(LayoutField::class, 'columnProportions'))->setValue($field, $input);
            self::assertSame('1fr 2fr 1fr', $field->getColumnWidths());
        }
    }

    public function testIconSizePresetsPreserveLegacyCustomDimensions(): void
    {
        foreach (['small' => 24, 'medium' => 48, 'large' => 64, 'custom' => 91, 'unknown' => 91] as $preset => $expected) {
            $field = $this->field(IconField::class, ['iconSize' => 91, 'iconSizePreset' => $preset]);
            self::assertSame($expected, $field->getDisplaySize());
            self::assertStringContainsString('width="'.$expected.'"', $this->html($field));
        }
        self::assertSame(91, $this->field(IconField::class, ['iconSize' => 91])->getDisplaySize());
    }

    public function testQuarterWidthLayoutsPreserveTheirRatioInRenderedStyles(): void
    {
        foreach (['three-one' => '3fr 1fr', 'one-three' => '1fr 3fr'] as $preset => $widths) {
            $field = new LayoutField($this->createMock(Form::class));
            (new \ReflectionProperty(LayoutField::class, 'preset'))->setValue($field, $preset);
            self::assertSame($preset, $field->getPreset());
            self::assertSame($widths, $field->getColumnWidths());
            self::assertStringContainsString('--freeform-columns: '.$widths, $field->getLayoutStyle());
            self::assertTrue($field->isStackedOnMobile());
        }
    }

    private function field(string $class, array $properties, bool $preview = false): ContentField
    {
        $form = $this->createConfiguredMock(Form::class, ['isPreview' => $preview]);
        $field = $this->getMockBuilder($class)->setConstructorArgs([$form])->onlyMethods(IconField::class === $class ? ['getTranslationTable', 'getIconSvg'] : ['getTranslationTable'])->getMock();
        if (IconField::class === $class) {
            $field->method('getIconSvg')->willReturn('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" aria-hidden="true"><path d="M0 0h512v512H0z"/></svg>');
        }
        $field->method('getTranslationTable')->willReturn(new TranslationTable());
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
