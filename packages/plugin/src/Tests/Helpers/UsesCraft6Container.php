<?php

namespace Solspace\Freeform\Tests\Helpers;

use Illuminate\Container\Container;
use Illuminate\Http\Request;
use Illuminate\Session\ArraySessionHandler;
use Illuminate\Session\Store;
use PHPUnit\Framework\Attributes\After;
use PHPUnit\Framework\Attributes\Before;

trait UsesCraft6Container
{
    private Container $previousLaravelContainer;

    #[Before]
    protected function isolateLaravelContainer(): void
    {
        $this->previousLaravelContainer = Container::getInstance();
        Container::setInstance(new Container());
        app()->instance('request', Request::create('/'));
        app()->instance('session', new Store('test', new ArraySessionHandler(120)));
    }

    #[After]
    protected function restoreLaravelContainer(): void
    {
        Container::setInstance($this->previousLaravelContainer);
    }
}
