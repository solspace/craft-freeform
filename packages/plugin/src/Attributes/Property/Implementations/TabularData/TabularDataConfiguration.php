<?php

namespace Solspace\Freeform\Attributes\Property\Implementations\TabularData;

use Solspace\Freeform\Library\Serialization\Normalizers\CustomNormalizerInterface;
use Symfony\Component\Serializer\Annotation\Ignore;

class TabularDataConfiguration implements CustomNormalizerInterface
{
    private array $configuration = [];

    public function add(
        string $key,
        string $label,
        ?string $type = null
    ): self {
        $this->configuration[] = new ColumnConfiguration($key, $label, $type);

        return $this;
    }

    #[Ignore]
    public function getConfiguration(): array
    {
        return $this->configuration;
    }

    #[Ignore]
    public function normalize(): array
    {
        return $this->configuration;
    }
}
