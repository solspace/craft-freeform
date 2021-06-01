<?php

namespace Solspace\Freeform\Bundles\Form\Context\Session\Bag;

use Carbon\Carbon;

class SessionBag implements \JsonSerializable
{
    /** @var Carbon */
    private $lastUpdate;

    /** @var int */
    private $formId;

    /** @var array */
    private $properties;

    /** @var array */
    private $attributes;

    public function __construct(int $formId, array $properties = [], array $attributes = [], Carbon $lastUpdate = null)
    {
        $this->formId = $formId;
        $this->properties = $properties;
        $this->attributes = $attributes;
        $this->lastUpdate = $lastUpdate ?? new Carbon();
    }

    public function getFormId(): int
    {
        return $this->formId;
    }

    public function getProperties(): array
    {
        return $this->properties;
    }

    public function setProperties(array $properties)
    {
        $this->properties = $properties;
    }

    public function getAttributes(): array
    {
        return $this->attributes;
    }

    public function setAttributes(array $attributes)
    {
        $this->attributes = $attributes;
    }

    public function getLastUpdate(): Carbon
    {
        return $this->lastUpdate;
    }

    public function setLastUpdate(Carbon $lastUpdate)
    {
        $this->lastUpdate = $lastUpdate;
    }

    public function jsonSerialize(): array
    {
        return [
            'formId' => $this->formId,
            'properties' => $this->properties,
            'attributes' => $this->attributes,
            'utime' => $this->getLastUpdate()->timestamp,
        ];
    }
}
