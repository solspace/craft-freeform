<?php

namespace Solspace\Freeform\Form\Settings\Implementations\Options;

use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionCollection;
use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionsGeneratorInterface;
use Solspace\Freeform\Attributes\Property\Property;
use Solspace\Freeform\Bundles\Form\Limiting\FormLimiting;

class FormLimitingOptions implements OptionsGeneratorInterface
{
    public function fetchOptions(?Property $property): OptionCollection
    {
        return (new OptionCollection())
            ->add(
                FormLimiting::NO_LIMIT,
                'Do not limit',
            )
            ->add(
                FormLimiting::NO_LIMIT_LOGGED_IN_USERS_ONLY,
                'Logged in Users Only - No Limit',
            )
            ->add(
                FormLimiting::LIMIT_ONCE_PER_LOGGED_IN_USERS_ONLY,
                'Logged in Users Only - Once per Form',
            )
            ->add(
                FormLimiting::LIMIT_ONCE_PER_EMAIL,
                'Anyone - Once per Email Address',
            )
            ->add(
                FormLimiting::LIMIT_ONCE_PER_USER_OR_COOKIE,
                'Anyone - Once per Logged in User or Guest Cookie',
            )
            ->add(
                FormLimiting::LIMIT_ONCE_PER_USER_OR_IP_OR_COOKIE,
                'Anyone - Once per Logged in User or Guest IP or Cookie',
            )
        ;
    }
}
