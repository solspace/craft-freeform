<?php

namespace Solspace\Freeform\Library\Composer\Components\Fields;

use Solspace\Freeform\Fields\DynamicRecipientField;
use Solspace\Freeform\Library\Composer\Components\AbstractField;
use Solspace\Freeform\Library\Composer\Components\Fields\DataContainers\Option;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\ExternalOptionsInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\MultipleValueInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Traits\OptionsKeyValuePairTrait;

abstract class AbstractExternalOptionsField extends AbstractField implements ExternalOptionsInterface
{
    use OptionsKeyValuePairTrait;

    /** @var Option[] */
    protected $options;

    /** @var string */
    protected $source;

    /** @var int|string */
    protected $target;

    /** @var array */
    protected $configuration;

    /**
     * {@inheritDoc}
     */
    public function getOptionSource(): string
    {
        return $this->source ?? self::SOURCE_CUSTOM;
    }

    /*-
     * @inheritDoc
     */
    public function getOptionTarget()
    {
        return $this->target;
    }

    /**
     * {@inheritDoc}
     */
    public function getOptionConfiguration(): array
    {
        return $this->configuration;
    }

    /**
     * @return Option[]
     */
    public function getOptions(): array
    {
        if ($this instanceof MultipleValueInterface) {
            $values = $this->values;
        } else {
            $values = $this->value;
        }

        if (null !== $this->getValueOverride()) {
            $values = $this->getValueOverride();
        }

        if ($this instanceof DynamicRecipientField) {
            $actualValues = [];
            foreach ($this->values as $value) {
                $actualValues[] = $this->getActualValue($value);
            }

            $values = $actualValues;
        }

        if (self::SOURCE_CUSTOM === $this->getOptionSource()) {
            if (!\is_array($values)) {
                $values = [$values];
            }

            $options = [];
            foreach ($this->options as $option) {
                $options[] = new Option(
                    $option->getLabel(),
                    $option->getValue(),
                    \in_array($option->getValue(), $values, false)
                );
            }

            return $options;
        }

        return $this
            ->getForm()
            ->getFieldHandler()
            ->getOptionsFromSource(
                $this->getOptionSource(),
                $this->getOptionTarget(),
                $this->getOptionConfiguration(),
                $values
            )
        ;
    }
}
