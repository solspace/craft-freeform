<?php

namespace Solspace\Freeform\Tests\Library;

use CraftCms\Cms\ProjectConfig\ProjectConfig;
use CraftCms\Cms\Route\Data\Route;
use CraftCms\Cms\Route\Routes;
use Illuminate\Events\Dispatcher;
use Illuminate\Http\Request;
use Illuminate\Routing\Router;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\Codepack\Components\RoutesComponent;
use Solspace\Freeform\Tests\Helpers\UsesCraft6Container;

#[CoversClass(RoutesComponent::class)]
class CodepackRoutesInstallTest extends TestCase
{
    use UsesCraft6Container;

    #[DataProvider('existingRoutes')]
    public function testInstalledRoutesMatchWithLaravelAndReinstallRepairsLegacyTokensWithoutDuplicates(bool $legacy): void
    {
        $installer = new RoutesComponent(__DIR__.'/../../codepack');
        $config = [];
        foreach ($installer->getData() as $index => $definition) {
            $parts = $definition->urlParts;
            array_walk_recursive($parts, static function (&$part): void {
                $part = stripslashes($part);
            });
            $parts[0] = 'freeform-demo/'.$parts[0];
            $config['existing-'.$index] = ['uriParts' => $parts];
        }
        if (!$legacy) {
            $config = [];
        }
        $projectConfig = $this->createMock(ProjectConfig::class);
        $projectConfig->method('get')->with('routes')->willReturnCallback(static function () use (&$config) { return $config; });
        app()->instance(ProjectConfig::class, $projectConfig);

        $saved = [];
        $routes = $this->createMock(Routes::class);
        $routes->method('saveRoute')->willReturnCallback(static function (Route $route) use (&$saved, $legacy): string {
            if ($legacy) {
                self::assertStringStartsWith('existing-', $route->uid ?? '');
            }
            $route->uid ??= 'new-'.\count($saved);
            $saved[$route->uid] = $route;

            return $route->uid;
        });
        app()->instance(Routes::class, $routes);
        $installer->install('freeform-demo');
        self::assertCount(11, $saved);

        $router = new Router(new Dispatcher(app()), app());
        foreach ($saved as $route) {
            $router->get($route->getUri(), static fn () => 'Demo');
        }
        $matched = $router->getRoutes()->match(Request::create('/freeform-demo/forms/basic-light/testerson'));
        self::assertSame(['template' => 'basic-light', 'form' => 'testerson'], $matched->parameters());
        $matched = $router->getRoutes()->match(Request::create('/freeform-demo/forms/basic-light/testerson/edit/abc123'));
        self::assertSame('abc123', $matched->parameter('id'));
        $matched = $router->getRoutes()->match(Request::create('/freeform-demo/submissions/testerson'));
        self::assertSame('testerson', $matched->parameter('form'));
        $matched = $router->getRoutes()->match(Request::create('/freeform-demo/submissions/delete/testerson/42'));
        self::assertSame('42', $matched->parameter('id'));

        $config = array_map(static fn (Route $route) => $route->configData(), $saved);
        $installer->install('freeform-demo');
        self::assertCount(11, $saved);
    }

    public static function existingRoutes(): array
    {
        return ['new installation' => [false], 'repair legacy installation' => [true]];
    }
}
