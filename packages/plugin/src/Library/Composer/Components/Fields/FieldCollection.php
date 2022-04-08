<?php

namespace Solspace\Freeform\Library\Composer\Components\Fields;

use Solspace\Freeform\Library\Composer\Components\FieldInterface;
use Solspace\Freeform\Library\Exceptions\FreeformException;

class FieldCollection implements \IteratorAggregate
{
    /** @var FieldInterface[] */
    private array $fields;

    public function __construct(array $fields = [])
    {
        $this->fields = $fields;
    }

    public function getList(string $implements = null): array
    {
        if (null !== $implements) {
            return array_filter($this->fields, function (FieldInterface $field) use ($implements) {
                return $field instanceof $implements;
            });
        }

        return $this->fields;
    }

    public function getIndexedByHandle(): array
    {
        $indexed = [];
        foreach ($this->fields as $field) {
            if (!$field->getHandle()) {
                continue;
            }

            $indexed[$field->getHandle()] = $field;
        }

        return $indexed;
    }

    public function get(int|string $identificator): FieldInterface
    {
        foreach ($this->fields as $field) {
            if (
                $field->getHandle() === $identificator
                || $field->getHash() === $identificator
                || (is_numeric($identificator) && $field->getId() === (int) $identificator)) {
                return $field;
            }
        }

        throw new FreeformException("Field with handle '{$identificator}' not found");
    }

    public function add(FieldInterface $field): self
    {
        $this->fields[] = $field;

        return $this;
    }

    public function getIterator(): \ArrayIterator
    {
        return new \ArrayIterator($this->fields);
    }
}
