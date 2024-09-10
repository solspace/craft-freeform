<?php

namespace Solspace\Freeform\Bundles\Backup\DTO;

class Field
{
    public string $uid;
    public string $name;
    public string $handle;
    public string $type;
    public bool $required = false;
    public array $metadata = [];
    public ?Layout $layout = null;
}
