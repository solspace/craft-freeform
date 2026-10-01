<?php

namespace Solspace\Freeform\Library\Serialization\Normalizers;

use Symfony\Component\Serializer\Attribute\Ignore;

interface IdentificatorInterface
{
    #[Ignore]
    public function getNormalizeIdentificator(): int|string|null;
}
