<?php

namespace Solspace\Freeform\Integrations\Elements\Entry;

use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionCollection;
use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionsGeneratorInterface;
use Solspace\Freeform\Attributes\Property\Property;

class EntryTypeOptionsGenerator implements OptionsGeneratorInterface
{
    public function fetchOptions(Property $property): OptionCollection
    {
        $options = new OptionCollection();

        $sections = \Craft::$app->sections->getAllSections();
        foreach ($sections as $section) {
            $sectionCollection = new OptionCollection();

            $entryTypes = $section->getEntryTypes();
            foreach ($entryTypes as $entryType) {
                $sectionCollection->add($entryType->id, $entryType->name);
            }

            $options->addCollection($section->name, $sectionCollection);
        }

        return $options;
    }
}
