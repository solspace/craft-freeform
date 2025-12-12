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
                \Craft::t('freeform', 'No restrictions'),
            )
            ->add(
                FormLimiting::NO_LIMIT_LOGGED_IN_USERS_ONLY,
                \Craft::t('freeform', 'Logged-in users — unlimited'),
            )
            ->add(
                FormLimiting::LIMIT_ONCE_PER_LOGGED_IN_USERS_ONLY,
                \Craft::t('freeform', 'Logged-in users — once per form'),
            )
            ->add(
                FormLimiting::LIMIT_ONCE_PER_EMAIL,
                \Craft::t('freeform', 'Anyone — once per email'),
            )
            ->add(
                FormLimiting::LIMIT_ONCE_PER_USER_OR_COOKIE,
                \Craft::t('freeform', 'Anyone — once per user or cookie'),
            )
            ->add(
                FormLimiting::LIMIT_ONCE_PER_USER_OR_IP_OR_COOKIE,
                \Craft::t('freeform', 'Anyone — once per user, IP, or cookie'),
            )
        ;
    }
}
