<?php

namespace Solspace\Freeform\Events;

use yii\base\Event as YiiEvent;

class Event extends YiiEvent
{
    public static function once(
        string $class,
        string $eventName,
        callable $callback,
        mixed $data = null,
        bool $append = true
    ): void {
        $handler = null;
        $handler = static function (YiiEvent $event) use (&$handler, $class, $eventName, $callback): void {
            YiiEvent::off($class, $eventName, $handler);
            $callback($event);
        };

        YiiEvent::on($class, $eventName, $handler, $data, $append);
    }
}
