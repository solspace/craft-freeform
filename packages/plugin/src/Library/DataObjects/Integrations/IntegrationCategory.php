<?php

namespace Solspace\Freeform\Library\DataObjects\Integrations;

class IntegrationCategory
{
    public string $label;

    public string $type;

    /** @var Integration[] */
    public array $children;
}
