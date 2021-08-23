<?php

namespace Solspace\Freeform\Library\Bags;

use Solspace\Freeform\Events\Bags\BagModificationEvent;
use Solspace\Freeform\Library\Exceptions\FreeformException;
use yii\base\Event;

abstract class AbstractBag implements BagInterface
{
    /** @var array */
    protected $contents;

    public function __construct(array $contents = [])
    {
        $this->contents = $contents;
    }

    public function __get($name)
    {
        return $this->get($name);
    }

    public function __set($name, $value)
    {
        return $this->set($name, $value);
    }

    public function __isset($name)
    {
        return true;
    }

    public function isset(string $key): bool
    {
        return isset($this->contents[$key]);
    }

    public function get(string $key, $defaultValue = null)
    {
        $value = $this->contents[$key] ?? $defaultValue;
        $event = new BagModificationEvent($this, $key, $value);
        Event::trigger(static::class, static::EVENT_ON_GET, $event);

        return $event->getValue();
    }

    public function set(string $key, $value): BagInterface
    {
        $this->contents[$key] = $value;
        Event::trigger(static::class, static::EVENT_ON_SET, new BagModificationEvent($this, $key, $value));

        return $this;
    }

    public function remove(string $key): BagInterface
    {
        Event::trigger(
            static::class,
            static::EVENT_ON_REMOVE,
            new BagModificationEvent($this, $key, $this->contents[$key] ?? null)
        );
        unset($this->contents[$key]);

        return $this;
    }

    public function merge($bag): BagInterface
    {
        if (!\is_array($bag) && !$bag instanceof BagInterface) {
            throw new FreeformException('Cannot merge incompatible bags');
        }

        foreach ($bag as $key => $value) {
            $this->set($key, $value);
        }

        return $this;
    }

    public function toArray(): array
    {
        return $this->contents;
    }

    public function jsonSerialize(): array
    {
        return $this->toArray();
    }

    public function getIterator(): \ArrayIterator
    {
        return new \ArrayIterator($this->contents);
    }
}
