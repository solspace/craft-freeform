<?php

namespace Solspace\Freeform\Integrations\Elements\User;

use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionCollection;
use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionsGeneratorInterface;
use Solspace\Freeform\Attributes\Property\Property;

class UserGroupsOptionsGenerator implements OptionsGeneratorInterface
{
    private static ?OptionCollection $cache = null;

    public function fetchOptions(?Property $property): OptionCollection
    {
        if (self::$cache === null) {
            $options = new OptionCollection();

            $groups = \Craft::$app->getUserGroups()->getAllGroups();
            foreach ($groups as $group) {
                $options->add($group->id, $group->name);
            }

            self::$cache = $options;
        }

        return self::$cache;
    }
}
