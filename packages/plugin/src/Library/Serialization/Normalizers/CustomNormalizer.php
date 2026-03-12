<?php

namespace Solspace\Freeform\Library\Serialization\Normalizers;

use Symfony\Component\Serializer\Normalizer\NormalizerInterface;

class CustomNormalizer implements NormalizerInterface
{
    public function normalize(mixed $data, ?string $format = null, array $context = []): array|\ArrayObject|bool|float|int|string|null
    {
        return $data->normalize();
    }

    public function supportsNormalization(mixed $data, ?string $format = null, array $context = []): bool
    {
        return $data instanceof CustomNormalizerInterface;
    }

    public function getSupportedTypes(?string $format): array
    {
        return [
            CustomNormalizerInterface::class => true,
        ];
    }
}
