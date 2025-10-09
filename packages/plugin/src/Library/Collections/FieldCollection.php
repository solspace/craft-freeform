<?php

namespace Solspace\Freeform\Library\Collections;

use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Interfaces\NoStorageInterface;
use Solspace\Freeform\Library\Exceptions\FreeformException;

/**
 * @template T of FieldInterface
 *
 * @implements \IteratorAggregate<int, T>
 */
class FieldCollection implements \IteratorAggregate, \ArrayAccess, \Countable
{
    public const STRATEGY_INCLUDES = 'includes';
    public const STRATEGY_EXCLUDES = 'excludes';

    /** @var T[] */
    private array $fields;

    /**
     * @param T[] $fields
     */
    public function __construct(array $fields = [])
    {
        $this->fields = array_values($fields);
    }

    /**
     * @return null|T
     */
    public function get(mixed $identificator): ?FieldInterface
    {
        if ($identificator instanceof FieldInterface) {
            $identificator = $identificator->getUid();
        }

        foreach ($this->fields as $field) {
            if (
                $field->getHandle() === $identificator
                || $field->getUid() === $identificator
                || (is_numeric($identificator) && $field->getId() === (int) $identificator)) {
                return $field;
            }
        }

        return null;
    }

    public function ids(): array
    {
        return array_map(
            fn (FieldInterface $field) => $field->getId(),
            $this->fields
        );
    }

    public function has(mixed $identificator): bool
    {
        try {
            return (bool) $this->get($identificator);
        } catch (FreeformException) {
            return false;
        }
    }

    /**
     * @template TField of FieldInterface
     *
     * @param null|array<class-string<TField>>|class-string<TField> $implements
     *
     * @return FieldCollection<TField>
     */
    public function getList(array|string|null $implements = null, ?string $strategy = self::STRATEGY_INCLUDES): self
    {
        if (null === $implements) {
            return $this;
        }

        if (\is_string($implements)) {
            $implements = [$implements];
        }

        $list = array_values(
            array_filter(
                $this->fields,
                function (FieldInterface $field) use ($implements, $strategy) {
                    if (self::STRATEGY_EXCLUDES === $strategy) {
                        foreach ($implements as $implement) {
                            if ($field instanceof $implement || $field->getType() === $implement) {
                                return false;
                            }
                        }

                        return true;
                    }

                    foreach ($implements as $implement) {
                        if ($field instanceof $implement || $field->getType() === $implement) {
                            return true;
                        }
                    }

                    return false;
                }
            )
        );

        return new self($list);
    }

    public function getExcludedList(string $implements): self
    {
        return $this->getList($implements, self::STRATEGY_EXCLUDES);
    }

    public function getListByHandle(?string $implements = null, string $strategy = self::STRATEGY_INCLUDES): array
    {
        $list = $this->getList($implements, $strategy);
        $indexed = [];
        foreach ($list as $field) {
            $indexed[$field->getHandle()] = $field;
        }

        return $indexed;
    }

    public function getFiltered(callable $filterFn): self
    {
        return new self(array_filter($this->fields, $filterFn));
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

    public function getStorableFields(): self
    {
        return $this->getExcludedList(NoStorageInterface::class);
    }

    public function cloneCollection(): self
    {
        $clonedList = [];
        foreach ($this->fields as $field) {
            $clonedList[] = clone $field;
        }

        return new self($clonedList);
    }

    /**
     * @return \ArrayIterator<int, T>
     */
    public function getIterator(): \ArrayIterator
    {
        return new \ArrayIterator($this->fields);
    }

    public function offsetExists(mixed $offset): bool
    {
        return \array_key_exists($offset, $this->getListByHandle());
    }

    public function offsetGet(mixed $offset): mixed
    {
        return $this->getListByHandle()[$offset];
    }

    public function offsetSet(mixed $offset, mixed $value): void
    {
        throw new FreeformException('Cannot set fields directly');
    }

    public function offsetUnset(mixed $offset): void
    {
        throw new FreeformException('Cannot delete fields directly');
    }

    public function isEmpty(): bool
    {
        return empty($this->fields);
    }

    public function count(): int
    {
        return \count($this->fields);
    }
}
