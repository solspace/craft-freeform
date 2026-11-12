<?php

namespace Solspace\Freeform\Tests\Library\Compatibility;

use CraftCms\Cms\Config\GeneralConfig;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Tests\Helpers\UsesCraft6Container;

#[CoversClass(Freeform::class)]
class Craft6PluginSettingsTest extends TestCase
{
    use UsesCraft6Container;

    #[TestWith(['getSettingsResponse'])]
    #[TestWith(['getReadOnlySettingsResponse'])]
    public function testPluginSettingsOpenFreeformsOwnSettingsScreen(string $method): void
    {
        app(GeneralConfig::class)->baseCpUrl('https://example.test')->cpTrigger('control');
        $plugin = (new \ReflectionClass(Freeform::class))->newInstanceWithoutConstructor();
        $response = $plugin->{$method}();

        self::assertSame(302, $response->getStatusCode());
        self::assertSame('https://example.test/control/freeform/settings', $response->getTargetUrl());
    }
}
