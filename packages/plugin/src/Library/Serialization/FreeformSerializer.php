<?php

namespace Solspace\Freeform\Library\Serialization;

use Doctrine\Common\Annotations\AnnotationReader;
use Solspace\Freeform\Library\Serialization\Encoders\JsonlEncoder;
use Solspace\Freeform\Library\Serialization\Normalizers\CarbonNormalizer;
use Solspace\Freeform\Library\Serialization\Normalizers\CustomNormalizer;
use Solspace\Freeform\Library\Serialization\Normalizers\IdentificationNormalizer;
use Symfony\Component\PropertyAccess\PropertyAccessor;
use Symfony\Component\Serializer\Encoder\JsonEncoder;
use Symfony\Component\Serializer\Mapping\Factory\ClassMetadataFactory;
use Symfony\Component\Serializer\Mapping\Loader\AnnotationLoader;
use Symfony\Component\Serializer\NameConverter\MetadataAwareNameConverter;
use Symfony\Component\Serializer\Normalizer\ObjectNormalizer;
use Symfony\Component\Serializer\Serializer;

class FreeformSerializer extends Serializer
{
    public function __construct()
    {
        $classMetadataFactory = new ClassMetadataFactory(new AnnotationLoader(new AnnotationReader()));

        $metadataAwareNameConverter = new MetadataAwareNameConverter($classMetadataFactory);
        $propertyAccessor = new PropertyAccessor();

        $encoders = ['json' => new JsonEncoder(), new JsonlEncoder()];
        $normalizers = [
            new IdentificationNormalizer(),
            new CustomNormalizer(),
            new CarbonNormalizer(),
            new ObjectNormalizer(
                $classMetadataFactory,
                $metadataAwareNameConverter,
                propertyAccessor: $propertyAccessor
            ),
        ];

        parent::__construct($normalizers, $encoders);
    }
}
