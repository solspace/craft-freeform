<?php

namespace Solspace\Freeform\Library\DataObjects\Integrations;

class IntegrationSetting
{
    public string $name;

    public string $handle;

    public string $type;

    public string $instructions;

    public mixed $value;

    public bool $required;
}
