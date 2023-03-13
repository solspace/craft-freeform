<?php

namespace Solspace\Freeform\Library\Collections;

use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Library\Exceptions\FreeformException;

/**
 * @implements \IteratorAggregate<int, FieldInterface>
 */
class FieldCollection implements \IteratorAggregate, \ArrayAccess
{
    /** @var FieldInterface[] */
    private array $fields;

    public function __construct(array $fields = [])
    {
        $this->fields = array_values($fields);
    }

    public function get(int|string $identificator): ?FieldInterface
    {
        foreach ($this->fields as $field) {
            if (
                $field->getHandle() === $identificator
                || $field->getHash() === $identificator
                || (is_numeric($identificator) && $field->getId() === (int) $identificator)) {
                return $field;
            }
        }

        return null;
    }

    public function getList(string $implements = null, bool $indexByHandle = false): array
    {
        $list = $this->fields;
        if (null !== $implements) {
            $list = array_values(
                array_filter(
                    $this->fields,
                    fn (FieldInterface $field) => $field instanceof $implements
                )
            );
        }

        if ($indexByHandle) {
            $indexed = [];
            foreach ($list as $field) {
                $indexed[$field->getHandle()] = $field;
            }

            return $indexed;
        }

        return $list;
    }

    public function getListByHandle(string $implements = null): array
    {
        return $this->getList($implements, true);
    }

    public function has(int|string $identificator): bool
    {
        try {
            return (bool) $this->get($identificator);
        } catch (FreeformException) {
            return false;
        }
    }

    public function add(FieldInterface $field): self
    {
        $this->fields[] = $field;

        return $this;
    }

    public function hasFieldOfClass(string $implementation): bool
    {
        return !empty($this->getList($implementation));
    }

    public function hasFieldType(string $type): bool
    {
        $type = strtolower($type);

        return \in_array(
            $type,
            array_map(
                fn ($field) => $field->getType(),
                $this->fields
            ),
            true
        );
    }

    public function getIterator(): \ArrayIterator
    {
        return new \ArrayIterator($this->fields);
    }

    public function offsetExists(mixed $offset): bool
    {
        return \array_key_exists($offset, $this->getList(indexByHandle: true));
    }

    public function offsetGet(mixed $offset): mixed
    {
        return $this->getList(indexByHandle: true)[$offset];
    }

    public function offsetSet(mixed $offset, mixed $value): void
    {
        throw new FreeformException('Cannot set fields directly');
    }

    public function offsetUnset(mixed $offset): void
    {
        throw new FreeformException('Cannot delete fields directly');
    }
}
