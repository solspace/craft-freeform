<?php

namespace Solspace\Freeform\Tests\Services;

use Illuminate\Container\Container;
use Illuminate\Http\Request;
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

    protected function setUp(): void
    {
        $this->previousContainer = Container::getInstance();
        Container::setInstance(new Container());
        app()->instance('request', Request::create('/login'));
        (new \ReflectionProperty(SettingsService::class, 'settingsModel'))->setValue(null);
    }

    protected function tearDown(): void
    {
        (new \ReflectionProperty(SettingsService::class, 'settingsModel'))->setValue(null);
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
}
