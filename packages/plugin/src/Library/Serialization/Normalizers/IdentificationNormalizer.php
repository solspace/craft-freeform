<?php

namespace Solspace\Freeform\Library\Serialization\Normalizers;

use Symfony\Component\Serializer\Normalizer\NormalizerInterface;

class IdentificationNormalizer implements NormalizerInterface
{
    public const NORMALIZE_TO_IDENTIFICATORS = 'normalize-to-identificators';

    public function normalize(mixed $data, ?string $format = null, array $context = []): array|\ArrayObject|bool|float|int|string|null
    {
        // @var $data IdentificatorInterface
        return $data->getNormalizeIdentificator();
    }

    public function supportsNormalization(mixed $data, ?string $format = null, array $context = []): bool
    {
        $canNormalize = $context[self::NORMALIZE_TO_IDENTIFICATORS] ?? false;

        return $canNormalize && $data instanceof IdentificatorInterface;
    }

    public function getSupportedTypes(?string $format): array
    {
        return [
            IdentificatorInterface::class => false,
        ];
    }
}
