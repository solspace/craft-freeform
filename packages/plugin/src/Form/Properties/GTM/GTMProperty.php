<?php

namespace Solspace\Freeform\Form\Properties\GTM;

class GTMProperty
{
    private bool $enabled;
    private ?string $id;
    private ?string $event;

    public function __construct(?array $data = null)
    {
        $this->enabled = $data['enabled'] ?? false;
        $this->id = $data['id'] ?? null;
        $this->event = $data['event'] ?? null;
    }

    public function isEnabled(): bool
    {
        return $this->enabled;
    }

    public function getId(): ?string
    {
        return $this->id;
    }

    public function getEvent(): ?string
    {
        return $this->event;
    }
}
