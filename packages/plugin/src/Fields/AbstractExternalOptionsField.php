<?php

namespace Solspace\Freeform\Fields;

use Solspace\Freeform\Attributes\Property\Property;
use Solspace\Freeform\Attributes\Property\Transformers\OptionsTransformer;
use Solspace\Freeform\Fields\Interfaces\ExternalOptionsInterface;
use Solspace\Freeform\Fields\Properties\Options\OptionsCollection;
use Solspace\Freeform\Fields\Traits\OptionsKeyValuePairTrait;

abstract class AbstractExternalOptionsField extends AbstractField implements ExternalOptionsInterface
{
    use OptionsKeyValuePairTrait;

    #[Property(
        label: 'Options Editor',
        type: Property::TYPE_OPTIONS,
        instructions: 'Define your options',
        value: OptionsTransformer::DEFAULT_VALUE,
        transformer: OptionsTransformer::class,
    )]
    protected OptionsCollection $options;

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

    public function getOptions(): OptionsCollection
    {
        return $this->options;
    }

    public function setOptions(array $options)
    {
        $this->cachedOptions = $options;
    }
}
