<?php

namespace Solspace\Freeform\Integrations\Elements\Entry;

use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionCollection;
use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionsGeneratorInterface;
use Solspace\Freeform\Attributes\Property\Property;
use Solspace\Freeform\Library\Helpers\SectionHelper;

class EntryTypeOptionsGenerator implements OptionsGeneratorInterface
{
    public function fetchOptions(?Property $property): OptionCollection
    {
        $options = new OptionCollection();

        $sections = SectionHelper::getAllSections();
        foreach ($sections as $section) {
            $sectionCollection = new OptionCollection($section->name);

            $entryTypes = $section->getEntryTypes();
            foreach ($entryTypes as $entryType) {
                $key = \sprintf('%s:%s', $section->id, $entryType->id);
                $sectionCollection->add($key, $entryType->name);
            }

            $options->addCollection($sectionCollection);
        }

        return $options;
    }
}
