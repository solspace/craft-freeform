<?php

namespace Solspace\Freeform\Bundles\Backup\DTO\Templates;

class WrapperTemplate
{
    public ?string $uid = null;
    public ?int $id = null;

    public string $name;
    public string $handle;
    public string $content;
    public ?string $description = null;
}
