<?php

namespace Solspace\Freeform\Library\DataObjects\Integrations;

class Integration
{
    public int $id;

    public string $name;

    public string $handle;

    public string $type;

    public ?string $icon;

    public array $settings;
}
