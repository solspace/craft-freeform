<?php

namespace Solspace\Freeform\Library\Bags;

interface BagInterface extends \JsonSerializable, \IteratorAggregate
{
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
