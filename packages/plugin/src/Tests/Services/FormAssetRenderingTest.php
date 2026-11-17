<?php

namespace Solspace\Freeform\Tests\Services;

use craft\web\View;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Events\Forms\RenderTagEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Models\Settings;
use Solspace\Freeform\Services\SettingsService;
use Solspace\Freeform\Tests\Helpers\UsesCraft6Container;

#[CoversClass(RenderTagEvent::class)]
class FormAssetRenderingTest extends TestCase
{
    use UsesCraft6Container;

    #[TestWith(['footer'])]
    #[TestWith(['form'])]
    #[TestWith(['manual'])]
    public function testAssetsUseExternalFilesAndRespectPlacement(string $location): void
    {
        $previousApp = \Craft::$app;
        $cache = new \ReflectionProperty(RenderTagEvent::class, 'addedScriptCache');
        $previousCache = $cache->getValue();
        $cache->setValue(null, []);
        $settings = new Settings(['scriptInsertLocation' => $location, 'scriptInsertType' => 'inline']);
        $provider = $this->createStub(SettingsService::class);
        $provider->method('getSettingsModel')->willReturn($settings);
        $provider->method('isManualScripts')->willReturn('manual' === $location);
        $form = $this->createStub(Form::class);
        $form->method('isPreview')->willReturn(false);
        $event = $this->getMockBuilder(RenderTagEvent::class)->setConstructorArgs([$form])->onlyMethods(['getSettingsService'])->getMock();
        $event->method('getSettingsService')->willReturn($provider);
        $view = new class {
            public array $scripts = [];
            public array $styles = [];

            public function registerJsFile($url, $options): void
            {
                $this->scripts[] = [$url, $options];
            }

            public function registerCssFile($url, $options): void
            {
                $this->styles[] = [$url, $options];
            }
        };
        \Craft::$app = new class($view) {
            public object $assetManager;

            public function __construct(private object $view)
            {
                $this->assetManager = new class {
                    public function getPublishedUrl($path, $publish): string
                    {
                        return '/assets/'.basename($path);
                    }
                };
            }

            public function getView(): object
            {
                return $this->view;
            }
        };

        try {
            // These paths deliberately contain no files: normal rendering must
            // publish URLs without reading and embedding their source content.
            $event->addScript('/tmp/freeform-external-script.js', ['defer' => true]);
            $event->addScript('/tmp/freeform-external-script.js', ['defer' => true]);
            $event->addStylesheet('/tmp/freeform-external-style.css');
            if ('footer' === $location) {
                self::assertSame([['/assets/freeform-external-script.js', ['position' => View::POS_END, 'defer' => true]]], $view->scripts);
                self::assertSame([['/assets/freeform-external-style.css', ['position' => View::POS_END]]], $view->styles);
                self::assertSame('', $event->getChunksAsString());
            } elseif ('form' === $location) {
                self::assertStringContainsString('src="/assets/freeform-external-script.js"', $event->getChunksAsString());
                self::assertStringContainsString('href="/assets/freeform-external-style.css"', $event->getChunksAsString());
                self::assertStringContainsString('defer', $event->getChunksAsString());
                self::assertSame(1, substr_count($event->getChunksAsString(), '<script'));
                self::assertSame([], $view->scripts);
                self::assertSame([], $view->styles);
            } else {
                self::assertSame('', $event->getChunksAsString());
                self::assertSame([], $event->getScripts());
                self::assertSame([], $event->getStyles());
                self::assertSame([], $view->scripts);
                self::assertSame([], $view->styles);
            }
        } finally {
            \Craft::$app = $previousApp;
            $cache->setValue(null, $previousCache);
        }
    }
}
