<?php

namespace Solspace\Freeform\Library\Bags;

interface BagInterface extends \JsonSerializable
{
    public function isset(string $key): bool;

    public function get(string $key, $defaultValue = null);

    public function add(string $key, $value);

    public function remove(string $key);
}
