<?php

namespace Solspace\Freeform\Library\DataObjects\Form\Defaults\ConfigItems;

interface DefaultConfigInterface
{
    public function getLabel(): string;

    public function getValue(): mixed;

    public function isLocked(): bool;
}
