<?php

namespace Solspace\Freeform\Fields\Properties\Options\Elements\Types\Entries;

use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionCollection;
use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionsGeneratorInterface;
use Solspace\Freeform\Attributes\Property\Property;

class SectionsOptionsGenerator implements OptionsGeneratorInterface
{
    public function fetchOptions(Property $property): OptionCollection
    {
        $collection = new OptionCollection();

        $sections = \Craft::$app->sections->getAllSections();
        foreach ($sections as $section) {
            $collection->add($section->id, $section->name);
        }

        return $collection;
    }
}
