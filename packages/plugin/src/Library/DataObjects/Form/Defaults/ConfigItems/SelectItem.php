<?php

namespace Solspace\Freeform\Library\DataObjects\Form\Defaults\ConfigItems;

use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionCollection;
use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionsGeneratorInterface;

class SelectItem extends BaseConfigItem
{
    public ?OptionsGeneratorInterface $optionsGenerator = null;
    public ?string $emptyValue = null;

    private OptionCollection $options;

    public function __construct($config = [])
    {
        $this->options = new OptionCollection();

        parent::__construct($config);
    }

    public function getOptions(): OptionCollection
    {
        $collection = $this->optionsGenerator ? $this->optionsGenerator->fetchOptions(null) : $this->options;

        if (null !== $this->emptyValue) {
            $collection->add('', $this->emptyValue, 0);
        }

        return $collection;
    }

    public function getValue(): string
    {
        return (string) $this->value;
    }
}
