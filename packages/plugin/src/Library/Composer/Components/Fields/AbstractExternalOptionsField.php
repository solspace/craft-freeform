<?php

namespace Solspace\Freeform\Library\Composer\Components\Fields;

use Solspace\Freeform\Attributes\Property\Property;
use Solspace\Freeform\Library\Composer\Components\AbstractField;
use Solspace\Freeform\Library\Composer\Components\Fields\DataContainers\Option;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\ExternalOptionsInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\MultipleValueInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Traits\OptionsKeyValuePairTrait;

abstract class AbstractExternalOptionsField extends AbstractField implements ExternalOptionsInterface
{
    use OptionsKeyValuePairTrait;

    #[Property(
        label: 'Options Editor',
        type: Property::TYPE_OPTIONS,
        instructions: 'Define your options',
    )]
    protected ?array $options = [];

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
        // TODO - https://github.com/solspace/craft-freeform/pull/553#issuecomment-1355052695
        return [];

        /*
        if ($this instanceof MultipleValueInterface) {
            $values = $this->values;
        } else {
            $values = $this->value;
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
        */
    }

    public function setOptions(array $options)
    {
        $this->cachedOptions = $options;
    }
}
