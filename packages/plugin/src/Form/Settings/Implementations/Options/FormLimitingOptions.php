<?php

namespace Solspace\Freeform\Form\Settings\Implementations\Options;

use Solspace\Freeform\Attributes\Property\Property;
use Solspace\Freeform\Attributes\Property\PropertyTypes\OptionCollection;
use Solspace\Freeform\Attributes\Property\PropertyTypes\OptionFetcherInterface;
use Solspace\Freeform\Bundles\Form\Limiting\FormLimiting;

class FormLimitingOptions implements OptionFetcherInterface
{
    public function fetchOptions(Property $property): OptionCollection
    {
        return (new OptionCollection())
            ->add(
                FormLimiting::NO_LIMIT,
                'Do not limit',
            )
            ->add(
                FormLimiting::NO_LIMIT_LOGGED_IN_USERS_ONLY,
                'Logged in Users only (no limit)',
            )
            ->add(
                FormLimiting::LIMIT_COOKIE,
                'Once per Cookie only',
            )
            ->add(
                FormLimiting::LIMIT_IP_COOKIE,
                'Once per IP/Cookie combo',
            )
            ->add(
                FormLimiting::LIMIT_ONCE_PER_LOGGED_IN_USERS_ONLY,
                'Once per logged in Users only',
            )
            ->add(
                FormLimiting::LIMIT_ONCE_PER_LOGGED_IN_USER_OR_GUEST_COOKIE_ONLY,
                'Once per logged in User or Guest Cookie only',
            )
            ->add(
                FormLimiting::LIMIT_ONCE_PER_LOGGED_IN_USER_OR_GUEST_IP_COOKIE_COMBO,
                'Once per logged in User or Guest IP/Cookie combo',
            )
        ;
    }
}
