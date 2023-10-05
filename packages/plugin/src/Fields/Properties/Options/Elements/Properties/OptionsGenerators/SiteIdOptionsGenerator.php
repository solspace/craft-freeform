<?php

namespace Solspace\Freeform\Fields\Properties\Options\Elements\Properties\OptionsGenerators;

use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionCollection;
use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionsGeneratorInterface;
use Solspace\Freeform\Attributes\Property\Property;

class SiteIdOptionsGenerator implements OptionsGeneratorInterface
{
    public function fetchOptions(?Property $property): OptionCollection
    {
        $collection = new OptionCollection();

        $sites = \Craft::$app->sites->getAllSites();
        foreach ($sites as $site) {
            $collection->add($site->id, $site->name);
        }

        return $collection;
    }
}
