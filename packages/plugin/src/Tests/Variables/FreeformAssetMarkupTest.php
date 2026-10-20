<?php

namespace Solspace\Freeform\Tests\Variables;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Services\SettingsService;
use Solspace\Freeform\Variables\FreeformVariable;
use Twig\Environment;
use Twig\Loader\ArrayLoader;
use Twig\Markup;

#[CoversClass(FreeformVariable::class)]
class FreeformAssetMarkupTest extends TestCase
{
    private mixed $previousApp;

    protected function setUp(): void
    {
        $this->previousApp = \Craft::$app;
        \Craft::$app = new class {
            public object $assetManager;

            public function __construct()
            {
                $this->assetManager = new class {
                    public function getPublishedUrl($path, $publish, $file): string
                    {
                        return '/assets/freeform/'.$file;
                    }
                };
            }
        };
    }

    protected function tearDown(): void
    {
        \Craft::$app = $this->previousApp;
    }

    #[TestWith(['loadFreeformPlugin'])]
    #[TestWith(['loadFreeformPluginJs'])]
    #[TestWith(['loadFreeformPluginCss'])]
    public function testAssetLoadersReturnUnescapedTwigMarkup(string $method): void
    {
        $settings = $this->createMock(SettingsService::class);
        $settings->method('getPluginJsPath')->willReturn('plugin.js');
        $settings->method('getPluginCssPath')->willReturn('plugin.css');
        $variable = $this->getMockBuilder(FreeformVariable::class)->onlyMethods(['getSettingsService'])->getMock();
        $variable->method('getSettingsService')->willReturn($settings);

        $markup = $variable->{$method}();
        self::assertInstanceOf(Markup::class, $markup);
        if ('loadFreeformPluginCss' !== $method) {
            self::assertStringContainsString('<script type="text/javascript" src="/assets/freeform/plugin.js"', (string) $markup);
        }
        if ('loadFreeformPluginJs' !== $method) {
            self::assertStringContainsString('<link rel="stylesheet" href="/assets/freeform/plugin.css"', (string) $markup);
        }

        $twig = new Environment(new ArrayLoader(['assets' => '{{ assets }}']), ['autoescape' => 'html']);
        self::assertSame((string) $markup, $twig->render('assets', ['assets' => $markup]));
    }

    public function testFormSpecificAssetsReturnMarkupEvenWhenThereAreNoAssets(): void
    {
        $form = $this->createMock(Form::class);
        $markup = (new FreeformVariable())->loadFormSpecificScripts($form);

        self::assertInstanceOf(Markup::class, $markup);
        self::assertSame('', (string) $markup);
    }
}
