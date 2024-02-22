<?php

namespace Solspace\Freeform\Attributes\Property\Implementations\FieldMapping;

use Solspace\Freeform\Library\Serialization\Normalizers\CustomNormalizerInterface;
use Symfony\Component\Serializer\Annotation\Ignore;

/**
 * @extends \IteratorAggregate<int, FieldMapItem>
 */
class FieldMapping implements CustomNormalizerInterface, \IteratorAggregate
{
    /** @var FieldMapItem[] */
    private array $mapping = [];

    public function add(string $source, string $type, string $value): self
    {
        $this->mapping[] = new FieldMapItem($type, $source, $value);

        return $this;
    }

    public function isSourceMapped(string $source): bool
    {
        foreach ($this->mapping as $item) {
            if ($source === $item->getSource() && $item->getValue()) {
                return true;
            }
        }

        return false;
    }

    public function getMapping(): array
    {
        return $this->mapping;
    }

    #[Ignore]
    public function normalize(): object
    {
        $data = [];
        foreach ($this->mapping as $item) {
            $data[$item->getSource()] = $item;
        }

        return (object) $data;
    }

    #[Ignore]
    public function sourceToFieldUid(): \Generator
    {
        foreach ($this->mapping as $item) {
            if (FieldMapItem::TYPE_RELATION === $item->getType()) {
                yield $item->getSource() => $item->getValue();
            }
        }
    }

    public function getIterator(): \ArrayIterator
    {
        return new \ArrayIterator($this->mapping);
    }
}
