<?php

namespace Solspace\Freeform\Form\Settings\Implementations\Options;

use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionCollection;
use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionsGeneratorInterface;
use Solspace\Freeform\Attributes\Property\Property;

class ProcessingDisplayOptions implements OptionsGeneratorInterface
{
    public const OPTIONS = ['button' => 'Button', 'overlay' => 'Overlay', 'both' => 'Both'];

    public function fetchOptions(?Property $property): OptionCollection
    {
        $options = new OptionCollection();
        foreach (self::OPTIONS as $value => $label) {
            $options->add($value, $label);
        }

        return $options;
    }
}
