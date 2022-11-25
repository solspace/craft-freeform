<?php

namespace Solspace\Freeform\Bundles\Normalizers\Implementations;

use Solspace\Freeform\Bundles\Fields\AttributeProvider;
use Solspace\Freeform\Bundles\Normalizers\Exceptions\NormalizerException;
use Solspace\Freeform\Bundles\Normalizers\NormalizerInterface;
use Solspace\Freeform\Library\Composer\Components\Form;
use Solspace\Freeform\Services\FormLayoutsService;
use Symfony\Component\PropertyAccess\PropertyAccessor;

class FormNormalizer implements NormalizerInterface
{
    public function __construct(
        private AttributeProvider $attributeProvider,
        private PropertyAccessor $propertyAccess,
        private FormLayoutsService $layoutsService
    ) {
    }

    public function normalize(object $object): object
    {
        if (!$object instanceof Form) {
            throw new NormalizerException(
                sprintf('Trying to normalize "%s" using "%s"', \get_class($object), self::class)
            );
        }

        $editableProperties = $this->attributeProvider->getEditableProperties($object::class);
        $properties = [];
        foreach ($editableProperties as $property) {
            $properties[$property->handle] = $this->propertyAccess->getValue($object, $property->handle);
        }

        return (object) [
            'id' => $object->getId(),
            'uid' => $object->getUid(),
            'type' => \get_class($object),
            'properties' => $properties,
            'layout' => [
                'pages' => $this->layoutsService->getPages($object->getId()),
                'layouts' => $this->layoutsService->getLayouts($object->getId()),
                'rows' => $this->layoutsService->getRows($object->getId()),
                'cells' => $this->layoutsService->getCells($object->getId()),
            ],
        ];
    }

    public function denormalize($object): Form
    {
        // TODO: Implement deserialize() method.
    }
}
