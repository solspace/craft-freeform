<?php

namespace Solspace\Freeform\Library\DataObjects\Form\Defaults\ConfigItems;

use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionCollection;
use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionsGeneratorInterface;

class SelectItem extends BaseConfigItem
{
    public ?array $optionsArray = null;
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
        if ($this->optionsGenerator) {
            $collection = $this->optionsGenerator->fetchOptions(null);
        } elseif ($this->optionsArray) {
            $collection = new OptionCollection();
            $collection->fromArray($this->optionsArray);
        } else {
            $collection = $this->options;
        }

        if (null !== $this->emptyValue) {
            $collection->add('', $this->emptyValue, 0);
        }

        return $collection;
    }

    public function getValue(): mixed
    {
        return (string) $this->value;
    }
}
