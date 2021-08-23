<?php

namespace Solspace\Freeform\Library\Bags;

interface BagInterface extends \JsonSerializable, \IteratorAggregate
{
    const EVENT_ON_SET = 'set';
    const EVENT_ON_GET = 'get';
    const EVENT_ON_REMOVE = 'remove';

    public function isset(string $key): bool;

    public function get(string $key, $defaultValue = null);

    public function set(string $key, $value): self;

    public function remove(string $key): self;

    /**
     * @param array|BagInterface $bag
     *
     * @return BagInterface
     */
    public function merge($bag): self;
}
