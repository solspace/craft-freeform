<?php

namespace Solspace\Freeform\Bundles\Transformers\Builder\Form\Links;

class Link
{
    public function __construct(
        private string $label,
        private string $url,
        private string $type,
        private int $count,
        private bool $internal = false,
    ) {}

    public function getLabel(): string
    {
        return $this->label;
    }

    public function getUrl(): string
    {
        return $this->url;
    }

    public function getType(): string
    {
        return $this->type;
    }

    public function getCount(): int
    {
        return $this->count;
    }

    public function isInternal(): bool
    {
        return $this->internal;
    }
}
