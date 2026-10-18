<?php

namespace Solspace\Freeform\Fields;

use Solspace\Freeform\Attributes\Property\Implementations\Options\Option;
use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionCollection;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Fields\Interfaces\EncryptionInterface;
use Solspace\Freeform\Fields\Interfaces\MultiValueInterface;
use Solspace\Freeform\Fields\Interfaces\OptionsInterface;
use Solspace\Freeform\Fields\Traits\EncryptionTrait;

/**
 * @implements \IteratorAggregate<int, Option|OptionCollection>
 */
abstract class BaseOptionsField extends AbstractField implements OptionsInterface, EncryptionInterface
{
    use EncryptionTrait;

    #[Input\Boolean(
        label: 'Sample data',
        instructions: 'Choose random options when the form loads. Turn off to use your default selections.',
        order: 900,
    )]
    protected bool $sampleData = false;

    public function isSampleDataEnabled(): bool
    {
        return $this->sampleData;
    }

    public function getLabels(): array
    {
        $labels = [];

        foreach ($this->getOptions() as $option) {
            if (!$option instanceof Option) {
                continue;
            }

            if ($this instanceof MultiValueInterface) {
                if (!\in_array($option->getValue(), $this->getValue())) {
                    continue;
                }
            } else {
                if ($option->getValue() != $this->getValue()) {
                    continue;
                }
            }

            $labels[] = $option->getLabel();
        }

        return $labels;
    }

    public function getReadableOutputValue(): string
    {
        return $this->getLabelsAsString();
    }

    public function getLabelsAsString(): string
    {
        return implode(', ', $this->getLabels());
    }

    public function translateOptionLabel(mixed $option): string
    {
        return (string) $option;
    }
}
