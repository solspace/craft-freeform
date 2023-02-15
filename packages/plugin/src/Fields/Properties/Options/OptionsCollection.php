<?php

namespace Solspace\Freeform\Fields\Properties\Options;

/**
 * @implements \IteratorAggregate<int, Option>
 */
abstract class OptionsCollection implements \IteratorAggregate, \JsonSerializable
{
    /** @var Option[] */
    protected array $options = [];

    public function add(string $label, string $value, bool $checked): self
    {
        $option = new Option();
        $option->label = $label;
        $option->value = $value;
        $option->checked = $checked;

        $this->options[] = $option;

        return $this;
    }

    public function getIterator(): \ArrayIterator
    {
        return new \ArrayIterator($this->options);
    }
}
