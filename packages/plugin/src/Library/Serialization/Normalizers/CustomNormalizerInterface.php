<?php

namespace Solspace\Freeform\Library\Serialization\Normalizers;

use Symfony\Component\Serializer\Attribute\Ignore;

interface CustomNormalizerInterface
{
    #[Ignore]
    public function normalize(): mixed;
}
