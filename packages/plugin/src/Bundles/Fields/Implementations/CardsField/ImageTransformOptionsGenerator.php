<?php

namespace Solspace\Freeform\Bundles\Fields\Implementations\CardsField;

use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionCollection;
use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionsGeneratorInterface;
use Solspace\Freeform\Attributes\Property\Property;

class ImageTransformOptionsGenerator implements OptionsGeneratorInterface
{
    public function fetchOptions(?Property $property): OptionCollection
    {
        $collection = new OptionCollection();

        $transforms = \Craft::$app->imageTransforms->getAllTransforms();
        foreach ($transforms as $transform) {
            $collection->add($transform->handle, $transform->name);
        }

        return $collection;
    }
}
