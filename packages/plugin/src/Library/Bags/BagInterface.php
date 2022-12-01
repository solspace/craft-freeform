<?php

namespace Solspace\Freeform\Library\Bags;

interface BagInterface extends \JsonSerializable, \IteratorAggregate
{
    public const EVENT_ON_SET = 'set';
    public const EVENT_ON_GET = 'get';
    public const EVENT_ON_REMOVE = 'remove';

    public function isset(string $key): bool;

    public function get(string $key, $defaultValue = null);

    public function set(string $key, $value): self;

    public function remove(string $key): self;

    /**
     * @param array|BagInterface $bag
     */
    public function merge($bag): self;
}
