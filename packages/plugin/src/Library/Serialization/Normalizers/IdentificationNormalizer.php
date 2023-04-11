<?php

namespace Solspace\Freeform\Library\Serialization\Normalizers;

use Symfony\Component\Serializer\Normalizer\ContextAwareNormalizerInterface;

class IdentificationNormalizer implements ContextAwareNormalizerInterface
{
    public const NORMALIZE_TO_IDENTIFICATORS = 'normalize-to-identificators';

    public function normalize($object, string $format = null, array $context = [])
    {
        // @var $object IdentificatorInterface
        return $object->getNormalizeIdentificator();
    }

    public function supportsNormalization($data, string $format = null, array $context = []): bool
    {
        $canNormalize = $context[self::NORMALIZE_TO_IDENTIFICATORS] ?? false;

        return $canNormalize && $data instanceof IdentificatorInterface;
    }
}
