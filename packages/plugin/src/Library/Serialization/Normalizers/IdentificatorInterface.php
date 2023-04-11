<?php

namespace Solspace\Freeform\Library\Serialization\Normalizers;

interface IdentificatorInterface
{
    public function getNormalizeIdentificator(): int|string|null;
}
