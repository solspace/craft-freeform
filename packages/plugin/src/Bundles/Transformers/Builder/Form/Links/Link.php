<?php

namespace Solspace\Freeform\Bundles\Transformers\Builder\Form\Links;

class Link
{
    public function __construct(
        private string $label,
        private string $url,
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

    public function isInternal(): bool
    {
        return $this->internal;
    }
}
