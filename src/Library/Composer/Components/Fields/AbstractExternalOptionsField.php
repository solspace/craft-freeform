<?php

namespace Solspace\Freeform\Library\Composer\Components\Fields;

use Solspace\Freeform\Library\Composer\Components\AbstractField;
use Solspace\Freeform\Library\Composer\Components\Fields\DataContainers\Option;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\ExternalOptionsInterface;
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
     * @inheritDoc
     */
    public function getOptionSource(): string
    {
        return $this->source ?? self::SOURCE_CUSTOM;
    }

    /**-
     * @inheritDoc
     */
    public function getOptionTarget()
    {
        return $this->target;
    }

    /**
     * @inheritDoc
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
        if ($this->getOptionSource() === self::SOURCE_CUSTOM) {
            $value = $this->getValue();
            if (!is_array($value)) {
                $value = [$value];
            }

            $options = [];
            foreach ($this->options as $option) {
                $options[] = new Option(
                    $option->getLabel(),
                    $option->getValue(),
                    \in_array($option->getValue(), $value, false)
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
                $this->getValue()
            );
    }
}
