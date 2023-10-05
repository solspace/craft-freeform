<?php

namespace Solspace\Freeform\Integrations\Elements\User;

use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionCollection;
use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionsGeneratorInterface;
use Solspace\Freeform\Attributes\Property\Property;

class UserGroupsOptionsGenerator implements OptionsGeneratorInterface
{
    public function fetchOptions(?Property $property): OptionCollection
    {
        $options = new OptionCollection();

        $groups = \Craft::$app->getUserGroups()->getAllGroups();
        foreach ($groups as $group) {
            $options->add($group->id, $group->name);
        }

        return $options;
    }
}
