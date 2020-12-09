<?php

namespace Solspace\Freeform\Library\DataObjects\Relations;

class Relationship
{
    /** @var int */
    private $elementId;

    /** @var string */
    private $fieldHandle;

    /**
     * Relationship constructor.
     *
     * @param int    $elementId
     * @param string $fieldHandle
     */
    public function __construct($elementId, $fieldHandle)
    {
        $this->elementId = (int) $elementId;
        $this->fieldHandle = (string) $fieldHandle;
    }

    public function getElementId(): int
    {
        return $this->elementId;
    }

    public function getFieldHandle(): string
    {
        return $this->fieldHandle;
    }
}
