<?php

namespace Solspace\Freeform\Tests\Helpers;

use Illuminate\Container\Container;
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
        Container::setInstance(new Container());
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
