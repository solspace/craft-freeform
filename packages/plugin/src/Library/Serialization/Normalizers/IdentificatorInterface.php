<?php

namespace Solspace\Freeform\Library\Serialization\Normalizers;

use Symfony\Component\Serializer\Annotation\Ignore;

interface IdentificatorInterface
{
    #[Ignore]
    public function getNormalizeIdentificator(): int|string|null;
}
