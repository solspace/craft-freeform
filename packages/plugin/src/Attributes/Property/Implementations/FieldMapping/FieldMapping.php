<?php

namespace Solspace\Freeform\Attributes\Property\Implementations\FieldMapping;

use Solspace\Freeform\Library\Serialization\Normalizers\CustomNormalizerInterface;
use Symfony\Component\Serializer\Annotation\Ignore;

class FieldMapping implements CustomNormalizerInterface
{
    /** @var FieldMapItem[] */
    private array $mapping = [];

    public function add(string $source, string $type, string $value): self
    {
        $this->mapping[] = new FieldMapItem($type, $source, $value);

        return $this;
    }

    public function getMapping(): array
    {
        return $this->mapping;
    }

    #[Ignore]
    public function normalize(): object
    {
        $data = [];
        foreach ($this->mapping as $item) {
            $data[$item->getSource()] = $item;
        }

        return (object) $data;
    }
}
