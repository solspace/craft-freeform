<?php

namespace Solspace\Freeform\Library\Serialization\Normalizers;

use Symfony\Component\Serializer\Annotation\Ignore;

interface CustomNormalizerInterface
{
    #[Ignore]
    public function normalize(): mixed;
}
