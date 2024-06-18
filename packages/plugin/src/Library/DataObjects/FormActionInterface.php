<?php

namespace Solspace\Freeform\Library\DataObjects;

interface FormActionInterface extends \JsonSerializable
{
    public function getName(): string;

    public function getMetadata(): array;
}
