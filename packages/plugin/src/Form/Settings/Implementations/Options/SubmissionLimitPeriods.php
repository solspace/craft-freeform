<?php

namespace Solspace\Freeform\Form\Settings\Implementations\Options;

use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionCollection;
use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionsGeneratorInterface;
use Solspace\Freeform\Attributes\Property\Property;
use Solspace\Freeform\Freeform;

class SubmissionLimitPeriods implements OptionsGeneratorInterface
{
    public function fetchOptions(?Property $property): OptionCollection
    {
        return (new OptionCollection())
            ->add('total', Freeform::t('Total'))
            ->add('day', Freeform::t('Per day'))
            ->add('week', Freeform::t('Per week'))
            ->add('month', Freeform::t('Per month'))
            ->add('year', Freeform::t('Per year'))
        ;
    }
}
