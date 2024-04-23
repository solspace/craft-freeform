<?php

namespace Solspace\Freeform\Library\DataObjects;

/**
 * @deprecated no longer used as of Freeform 5.x
 */
interface FormActionInterface extends \JsonSerializable
{
    public function getName(): string;

    public function getMetadata(): array;
}
