<?php

namespace Solspace\Freeform\Library\Exceptions\Api;

interface ApiErrorCollectionInterface
{
    public function hasErrors(): bool;

    public function asArray(): array;
}
