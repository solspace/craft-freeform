<?php

namespace Solspace\Freeform\Bundles\Backup\DTO;

use Solspace\Freeform\Library\Serialization\Normalizers\CustomNormalizerInterface;
use Symfony\Component\Serializer\Annotation\Ignore;

class Submission implements CustomNormalizerInterface
{
    public string $title;
    public string $status;
    private array $values = [];

    public function __set(string $name, $value): void
    {
        $this->values[$name] = $value;
    }

    public function __get(string $name)
    {
        return $this->values[$name] ?? null;
    }

    public function getValues(): array
    {
        return $this->values;
    }

    #[Ignore]
    public function normalize(): array
    {
        return $this->values;
    }
}
