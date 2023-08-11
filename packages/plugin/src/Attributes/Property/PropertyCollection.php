<?php

namespace Solspace\Freeform\Attributes\Property;

use IteratorAggregate;

/**
 * @extends IteratorAggregate<int, Property>
 */
class PropertyCollection implements \IteratorAggregate
{
    /** @var Property[] */
    private array $properties = [];

    public function get(string $handle): ?Property
    {
        return current(
            array_filter(
                $this->properties,
                fn ($property) => $property->handle === $handle
            )
        ) ?: null;
    }

    public function add(Property ...$properties): self
    {
        foreach ($properties as $property) {
            $this->properties[] = $property;
        }

        usort($this->properties, fn ($a, $b) => $a->order <=> $b->order);

        return $this;
    }

    public function removeFlagged(string ...$flags): self
    {
        foreach ($this->properties as $index => $property) {
            foreach ($flags as $flag) {
                if ($property->hasFlag($flag)) {
                    unset($this->properties[$index]);
                }
            }
        }

        $this->properties = array_values($this->properties);

        return $this;
    }

    public function getNextOrder(): int
    {
        if (empty($this->properties)) {
            return 1;
        }

        $existingOrders = array_map(fn ($prop) => $prop->order ?? 1, $this->properties);
        $order = 0;
        do {
            ++$order;
        } while (\in_array($order, $existingOrders, true) || $order > 100);

        return $order;
    }

    public function getProperties(): array
    {
        return $this->properties;
    }

    public function getIterator(): \ArrayIterator
    {
        return new \ArrayIterator($this->properties);
    }
}
