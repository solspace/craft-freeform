<?php

namespace Solspace\Freeform\Library\DataObjects;

abstract class AbstractFormAction implements FormActionInterface
{
    /** @var array */
    protected $metadata;

    /**
     * AbstractFormAction constructor.
     */
    public function __construct(array $metadata = [])
    {
        $this->metadata = $metadata;
    }

    public function getMetadata(): array
    {
        return $this->metadata;
    }

    /**
     * Specify data which should be serialized to JSON.
     *
     * @see  https://php.net/manual/en/jsonserializable.jsonserialize.php
     *
     * @return mixed data which can be serialized by <b>json_encode</b>,
     *               which is a value of any type other than a resource
     *
     * @since 5.4.0
     */
    public function jsonSerialize()
    {
        return [
            'name' => $this->getName(),
            'metadata' => $this->getMetadata(),
        ];
    }
}
