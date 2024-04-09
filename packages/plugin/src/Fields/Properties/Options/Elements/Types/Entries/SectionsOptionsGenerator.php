<?php

namespace Solspace\Freeform\Fields\Properties\Options\Elements\Types\Entries;

use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionCollection;
use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionsGeneratorInterface;
use Solspace\Freeform\Attributes\Property\Property;
use Solspace\Freeform\Library\Helpers\SectionHelper;

class SectionsOptionsGenerator implements OptionsGeneratorInterface
{
    public function fetchOptions(?Property $property): OptionCollection
    {
        $collection = new OptionCollection();

        $sections = SectionHelper::getAllSections();
        foreach ($sections as $section) {
            $collection->add($section->id, $section->name);
        }

        return $collection;
    }
}
