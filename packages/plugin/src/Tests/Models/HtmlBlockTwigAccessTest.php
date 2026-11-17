<?php

namespace Solspace\Freeform\Tests\Models;

use craft\services\ProjectConfig;
use craft\web\Request;
use craft\web\View;
use PHPUnit\Framework\Attributes\CoversNothing;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Bundles\Settings\DefaultsProvider;
use Solspace\Freeform\Fields\Implementations\HtmlField;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Form\Layout\FormLayout;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Configuration\TwigAccessUpgrade;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\Defaults;
use Solspace\Freeform\migrations\m261116_191000_CombineHtmlBlockTwigAccess;
use Solspace\Freeform\Models\Settings;
use Solspace\Freeform\Services\SettingsService;
use Solspace\Freeform\Tests\Helpers\UsesCraft6Container;

#[CoversNothing]
class HtmlBlockTwigAccessTest extends TestCase
{
    use UsesCraft6Container;

    #[TestWith([false, false, 'disabled'])]
    #[TestWith([false, true, 'disabled'])]
    #[TestWith([true, true, 'form'])]
    #[TestWith([true, false, 'craft'])]
    public function testLegacyCombinationsPreserveAccessAndRemoveBothOldPaths(bool $enabled, bool $isolated, string $expected): void
    {
        $legacy = ['defaults' => ['twigInHtml' => $enabled, 'twigIsolation' => $isolated, 'previewHtml' => false], 'pluginName' => 'Custom'];
        $updated = TwigAccessUpgrade::settings($legacy);
        self::assertSame($updated, TwigAccessUpgrade::settings($updated));
        self::assertSame('Custom', $updated['pluginName']);
        $settings = new Settings($legacy);
        self::assertSame($expected, $settings->defaults->twigAccess);
        self::assertFalse($settings->defaults->previewHtml);
        self::assertArrayNotHasKey('twigInHtml', $settings->defaults->jsonSerialize());
        self::assertArrayNotHasKey('twigIsolation', $settings->defaults->jsonSerialize());
        $service = $this->createMock(SettingsService::class);
        $service->method('getSettingsModel')->willReturn($settings);
        self::assertSame($enabled, (new DefaultsProvider($service))->isLocked('twigEnabled'));
    }

    public function testNewChoiceWinsAndMalformedAccessCannotEnableCraftVariables(): void
    {
        $defaults = new Defaults(['twigAccess' => 'disabled', 'twigInHtml' => true, 'twigIsolation' => false]);
        self::assertFalse($defaults->isTwigEnabled());
        self::assertSame('form', (new Defaults(['twigAccess' => 'unknown']))->twigAccess);
        self::assertSame('disabled', (new Defaults(['twigInHtml' => 'false', 'twigIsolation' => 'false']))->twigAccess);
    }

    #[TestWith(['disabled', '{{ craftValue|default("isolated") }}'])]
    #[TestWith(['form', 'isolated'])]
    #[TestWith(['craft', 'Craft context'])]
    public function testHtmlRenderingUsesTheSelectedContext(string $mode, string $expected): void
    {
        $settings = new Settings(['defaults' => ['twigAccess' => $mode]]);
        $service = $this->createMock(SettingsService::class);
        $service->method('getSettingsModel')->willReturn($settings);
        $plugin = $this->getMockBuilder(Freeform::class)->disableOriginalConstructor()->onlyMethods(['__get'])->getMock();
        $plugin->method('__get')->willReturnMap([['settings', $service]]);
        app()->instance(Freeform::class, $plugin);
        $form = $this->createMock(Form::class);
        $form->method('getLayout')->willReturn(new FormLayout());
        $field = $this->getMockBuilder(HtmlField::class)->disableOriginalConstructor()->onlyMethods(['getContent', 'isTwig', 'getForm'])->getMock();
        $field->method('isTwig')->willReturn(true);
        $field->method('getForm')->willReturn($form);
        $field->method('getContent')->willReturn('{{ craftValue|default("isolated") }}');
        $request = $this->createStub(Request::class);
        $request->method('getIsCpRequest')->willReturn(false);
        $view = $this->createMock(View::class);
        $view->expects('craft' === $mode ? self::once() : self::never())->method('renderString')->willReturn('Craft context');
        $before = \Craft::$app;
        \Craft::$app = (object) ['request' => $request, 'view' => $view];

        try {
            self::assertSame($expected, $field->getInputHtml());
        } finally {
            \Craft::$app = $before;
        }
    }

    #[TestWith([false])]
    #[TestWith([true])]
    public function testMigrationAndReadOnlyRuntimeBothPreserveExistingPermissions(bool $readOnly): void
    {
        $stored = ['defaults' => ['twigInHtml' => true, 'twigIsolation' => false, 'previewHtml' => true]];
        $config = $this->getMockBuilder(ProjectConfig::class)->disableOriginalConstructor()->onlyMethods(['get', 'set'])->getMock();
        $config->readOnly = $readOnly;
        $config->method('get')->willReturnCallback(static fn ($path, $external = false) => $external ? '6.0.4' : $stored);
        $written = null;
        $config->expects($readOnly ? self::never() : self::once())->method('set')->willReturnCallback(static function ($path, $value) use (&$written) {
            $written = $value;

            return true;
        });
        $before = \Craft::$app;
        \Craft::$app = (object) ['projectConfig' => $config];

        try {
            $migration = (new \ReflectionClass(m261116_191000_CombineHtmlBlockTwigAccess::class))->newInstanceWithoutConstructor();
            self::assertTrue($migration->safeUp());
            self::assertSame('craft', (new Settings($written ?? $stored))->defaults->twigAccess);
        } finally {
            \Craft::$app = $before;
        }
    }
}
