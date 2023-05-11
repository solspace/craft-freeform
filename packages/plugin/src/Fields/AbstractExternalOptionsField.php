<?php

namespace Solspace\Freeform\Fields;

use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionsTransformer;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\ValueTransformer;
use Solspace\Freeform\Fields\Interfaces\ExternalOptionsInterface;
use Solspace\Freeform\Fields\Properties\Options\OptionsCollection;
use Solspace\Freeform\Fields\Traits\OptionsKeyValuePairTrait;

abstract class AbstractExternalOptionsField extends AbstractField implements ExternalOptionsInterface
{
    use OptionsKeyValuePairTrait;

    #[ValueTransformer(OptionsTransformer::class)]
    #[Input\Options(
        label: 'Options Editor',
        instructions: 'Define your options',
        value: OptionsTransformer::DEFAULT_VALUE,
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

    public function getOptionTarget()
    {
        return $this->target;
    }

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
