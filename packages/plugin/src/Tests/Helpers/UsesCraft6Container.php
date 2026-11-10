<?php

namespace Solspace\Freeform\Tests\Helpers;

use CraftCms\Cms\Config\GeneralConfig;
use CraftCms\Cms\Database\DatabaseServiceProvider;
use CraftCms\Cms\Field\Fields;
use CraftCms\Cms\Site\Sites;
use Illuminate\Config\Repository;
use Illuminate\Container\Container;
use Illuminate\Contracts\Debug\ExceptionHandler;
use Illuminate\Database\Connectors\ConnectionFactory;
use Illuminate\Database\DatabaseManager;
use Illuminate\Events\Dispatcher;
use Illuminate\Filesystem\Filesystem;
use Illuminate\Foundation\Application;
use Illuminate\Http\Request;
use Illuminate\Session\ArraySessionHandler;
use Illuminate\Session\Store;
use Illuminate\Support\Facades\Facade;
use PHPUnit\Framework\Attributes\After;
use PHPUnit\Framework\Attributes\Before;

trait UsesCraft6Container
{
    private Container $previousLaravelContainer;
    private mixed $previousLaravelFacadeApplication;

    #[Before]
    protected function isolateLaravelContainer(): void
    {
        $this->previousLaravelContainer = Container::getInstance();
        $this->previousLaravelFacadeApplication = Facade::getFacadeApplication();
        Container::setInstance(new Application(sys_get_temp_dir()));
        app()->instance('config', new Repository([
            'app' => ['url' => 'https://example.test', 'key' => str_repeat('x', 32)],
            'database' => ['default' => 'testing', 'connections' => ['testing' => ['driver' => 'sqlite', 'database' => ':memory:', 'prefix' => '']]],
        ]));
        $handler = $this->createStub(ExceptionHandler::class);
        $handler->method('report')->willReturnCallback(static function ($exception) { throw $exception; });
        app()->instance(ExceptionHandler::class, $handler);
        app()->instance('files', new Filesystem());
        $dispatcher = new Dispatcher(app());
        app()->instance('events', $dispatcher);
        app()->instance(\Illuminate\Contracts\Events\Dispatcher::class, $dispatcher);
        (new DatabaseServiceProvider(app()))->register();
        app()->instance('db', new DatabaseManager(app(), new ConnectionFactory(app())));
        app()->instance(GeneralConfig::class, new GeneralConfig(['baseCpUrl' => 'https://example.test/admin']));
        $fields = $this->createStub(Fields::class);
        $fields->method('getAllFields')->willReturn(collect());
        app()->instance(Fields::class, $fields);
        $sites = $this->createStub(Sites::class);
        $sites->method('isMultiSite')->willReturn(false);
        app()->instance(Sites::class, $sites);
        Facade::clearResolvedInstances();
        Facade::setFacadeApplication(app());
        app()->instance('request', Request::create('/'));
        app()->instance('session', new Store('test', new ArraySessionHandler(120)));
    }

    #[After]
    protected function restoreLaravelContainer(): void
    {
        Facade::clearResolvedInstances();
        Facade::setFacadeApplication($this->previousLaravelFacadeApplication);
        Container::setInstance($this->previousLaravelContainer);
    }
}
