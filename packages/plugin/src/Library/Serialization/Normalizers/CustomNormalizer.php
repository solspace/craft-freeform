<?php

namespace Solspace\Freeform\Library\Serialization\Normalizers;

use Symfony\Component\Serializer\Normalizer\NormalizerInterface;

class CustomNormalizer implements NormalizerInterface
{
    public function normalize($object, string $format = null, array $context = [])
    {
        return $object->normalize();
    }

    public function supportsNormalization($data, string $format = null): bool
    {
        return $data instanceof CustomNormalizerInterface;
    }
}
