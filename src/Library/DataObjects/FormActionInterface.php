<?php

namespace Solspace\Freeform\Library\DataObjects;

interface FormActionInterface extends \JsonSerializable
{
    /**
     * @return string
     */
    public function getName(): string;

    /**
     * @return array
     */
    public function getMetadata(): array;
}
