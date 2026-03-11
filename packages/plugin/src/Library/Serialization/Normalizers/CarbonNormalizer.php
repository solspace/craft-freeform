<?php

namespace Solspace\Freeform\Library\Serialization\Normalizers;

use Carbon\Carbon;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;

class CarbonNormalizer implements NormalizerInterface
{
    public function normalize(mixed $data, ?string $format = null, array $context = []): array|\ArrayObject|bool|float|int|string|null
    {
        return $data->toIso8601String();
    }

    public function supportsNormalization(mixed $data, ?string $format = null, array $context = []): bool
    {
        return $data instanceof Carbon;
    }

    public function getSupportedTypes(?string $format): array
    {
        return [
            Carbon::class => true,
        ];
    }
}
