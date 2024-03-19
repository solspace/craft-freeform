<?php

namespace Solspace\Freeform\Library\Serialization\Normalizers;

use Carbon\Carbon;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;

class CarbonNormalizer implements NormalizerInterface
{
    /**
     * @param Carbon $object
     */
    public function normalize($object, ?string $format = null, array $context = []): string
    {
        return $object->toIso8601String();
    }

    public function supportsNormalization($data, ?string $format = null): bool
    {
        return $data instanceof Carbon;
    }
}
