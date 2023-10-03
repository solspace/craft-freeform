<?php

namespace Solspace\Freeform\Fields\Properties\Options\Elements\Types\Categories;

use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionCollection;
use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionsGeneratorInterface;
use Solspace\Freeform\Attributes\Property\Property;

class CategoryGroupsOptionsGenerator implements OptionsGeneratorInterface
{
    public function fetchOptions(?Property $property): OptionCollection
    {
        $collection = new OptionCollection();

        $groups = \Craft::$app->categories->getAllGroups();
        foreach ($groups as $group) {
            $collection->add($group->id, $group->name);
        }

        return $collection;
    }
}
