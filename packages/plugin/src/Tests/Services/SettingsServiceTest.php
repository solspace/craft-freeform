<?php

namespace Solspace\Freeform\Tests\Services;

use CraftCms\Cms\Plugin\Plugins;
use CraftCms\Cms\Plugin\PluginSettings;
use CraftCms\Cms\ProjectConfig\ProjectConfig;
use CraftCms\Cms\ProjectConfig\ProjectConfigHelper;
use Illuminate\Container\Container;
use Illuminate\Contracts\Validation\Factory as ValidationFactory;
use Illuminate\Events\Dispatcher;
use Illuminate\Http\Request;
use Illuminate\Session\ArraySessionHandler;
use Illuminate\Session\Store;
use Illuminate\Translation\ArrayLoader;
use Illuminate\Translation\Translator;
use Illuminate\Validation\Factory;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\Defaults;
use Solspace\Freeform\Models\Settings;
use Solspace\Freeform\Services\SettingsService;

#[CoversClass(SettingsService::class)]
class SettingsServiceTest extends TestCase
{
    private Container $previousContainer;
    private mixed $previousCraftApp;

    protected function setUp(): void
    {
        $this->previousContainer = Container::getInstance();
        Container::setInstance(new Container());
        app()->instance('request', Request::create('/login'));
        app()->instance('session', new Store('test', new ArraySessionHandler(120)));
        app()->instance('events', new Dispatcher(app()));
        app()->instance(ValidationFactory::class, new Factory(new Translator(new ArrayLoader(), 'en'), app()));
        app()->instance(Plugins::class, new \ReflectionClass(Plugins::class)->newInstanceWithoutConstructor());
        $this->previousCraftApp = \Craft::$app;
        \Craft::$app = (object) ['plugins' => new \craft\services\Plugins()];
        (new \ReflectionProperty(SettingsService::class, 'settingsModel'))->setValue(null, null);
    }

    protected function tearDown(): void
    {
        (new \ReflectionProperty(SettingsService::class, 'settingsModel'))->setValue(null, null);
        \Craft::$app = $this->previousCraftApp;
        Container::setInstance($this->previousContainer);
    }

    public function testReturnsDefaultSettingsWhenPluginReturnsNull(): void
    {
        $plugin = $this->createMock(Freeform::class);
        $plugin->expects(self::once())->method('getSettings')->willReturn(null);
        app()->instance(Freeform::class, $plugin);

        $service = new SettingsService();
        $settings = $service->getSettingsModel();

        self::assertInstanceOf(Settings::class, $settings);
        self::assertInstanceOf(Defaults::class, $settings->defaults);
        self::assertSame($settings, $service->getSettingsModel());
    }

    public function testCraft6CreatesAndRetainsTheNativeSettingsModel(): void
    {
        $plugin = $this->plugin();
        $settings = $plugin->getSettings();

        self::assertInstanceOf(PluginSettings::class, $settings);
        self::assertInstanceOf(Settings::class, $settings);
        self::assertSame($settings, $plugin->getSettings());
        self::assertInstanceOf(Settings::class, Freeform::config());
        self::assertNotSame($settings, Freeform::config());

        $plugin->setSettings(['pluginName' => 'Saved Name', 'defaults' => ['previewHtml' => false]]);

        self::assertSame('Saved Name', $settings->pluginName);
        self::assertFalse($settings->defaults->previewHtml);
    }

    public function testSavePersistsPartialSettingsAndPreservesUnrelatedSettings(): void
    {
        $plugin = $this->plugin();
        $plugin->setSettings([
            'pluginName' => 'Existing Name',
            'formSubmitDisable' => 'false',
            'defaults' => ['previewHtml' => false],
            'surveys' => ['highlightHighest' => false],
        ]);
        $settings = $plugin->getSettings();
        $projectConfig = $this->createMock(ProjectConfig::class);
        $projectConfig->expects(self::once())->method('set')->willReturnCallback(
            static function (string $path, array $value): bool {
                self::assertSame('plugins.freeform.settings', $path);
                $saved = ProjectConfigHelper::unpackAssociativeArrays($value);
                self::assertSame('Existing Name', $saved['pluginName']);
                self::assertSame('true', $saved['formSubmitDisable']);
                self::assertSame(900, $saved['queuePingMinIntervalSeconds']);
                self::assertFalse($saved['defaults']['previewHtml']);
                self::assertSame(['highlightHighest' => false], $saved['surveys']);
                self::assertArrayNotHasKey('errors', $saved);
                self::assertArrayNotHasKey('ruleset', $saved);
                self::assertArrayNotHasKey('queuePingMinIntervalMinutes', $saved);

                return true;
            }
        );
        app()->instance(ProjectConfig::class, $projectConfig);

        $service = new SettingsService();
        self::assertTrue($service->saveSettings(['formSubmitDisable' => 'true', 'queuePingMinIntervalMinutes' => '15']));
        self::assertSame($settings, $plugin->getSettings());
        self::assertSame($settings, $service->getSettingsModel());
        self::assertSame([], $settings->getErrors());
        self::assertArrayNotHasKey('errors', $settings->toArray());
    }

    public function testInvalidTemplateDirectoryDoesNotSaveAndReturnsFieldErrors(): void
    {
        $plugin = $this->plugin();
        $projectConfig = $this->createMock(ProjectConfig::class);
        $projectConfig->expects(self::never())->method('set');
        app()->instance(ProjectConfig::class, $projectConfig);

        $service = new SettingsService();
        self::assertFalse($service->saveSettings(['formTemplateDirectory' => __DIR__.'/missing-directory']));
        self::assertNotEmpty($plugin->getSettings()->getErrors('formTemplateDirectory'));
        self::assertSame([], $plugin->getSettings()->getErrors('pluginName'));

        $validSettings = new Settings(['formTemplateDirectory' => __DIR__]);
        self::assertTrue($validSettings->validate());
        self::assertSame([], $validSettings->getErrors());
    }

    private function plugin(): Freeform
    {
        $plugin = new \ReflectionClass(Freeform::class)->newInstanceWithoutConstructor();
        $plugin->handle = 'freeform';
        app()->instance(Freeform::class, $plugin);

        return $plugin;
    }
}
