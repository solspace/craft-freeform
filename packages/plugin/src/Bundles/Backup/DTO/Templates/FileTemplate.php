<?php

namespace Solspace\Freeform\Bundles\Backup\DTO\Templates;

use Symfony\Component\Serializer\Attribute\Ignore;

class FileTemplate
{
    public string $name;
    public string $fileName;

    #[Ignore]
    public ?string $path;
}
