<?php

namespace Solspace\Freeform\Library\Attributes;

class Attributes implements \ArrayAccess, \Countable
{
    private array $attributes = [];

    public function __construct(array $attributes = [])
    {
        $this->setBatch($attributes);
    }

    public function __toString(): string
    {
        $stringArray = [];

        foreach ($this->attributes as $key => $value) {
            if (null === $key && !empty($value)) {
                $key = $value;
                $value = '';
            }

            if (\is_bool($value) && !$value) {
                continue;
            }

            $key = htmlspecialchars($key, \ENT_QUOTES, 'UTF-8');

            $type = \gettype($value);
            if ('boolean' === $type || '' === $value) {
                $stringArray[] = $key;

                continue;
            }

            $value = match (\gettype($value)) {
                'array' => implode(' ', (array) $value),
                'object' => implode(
                    ' ',
                    array_map(
                        fn ($value, $key) => sprintf('%s:%s', $value, $key),
                        array_keys((array) $value),
                        (array) $value
                    )
                ),
                default => $value,
            };

            $value = htmlspecialchars($value, \ENT_QUOTES, 'UTF-8');

            $stringArray[] = "{$key}=\"{$value}\"";
        }

        $stringArray = array_filter($stringArray);

        return implode(' ', $stringArray);
    }

    public function get(string $key, mixed $default = null): ?string
    {
        return $this->attributes[$key] ?? $default;
    }

    public function set(?string $key, mixed $value = null): self
    {
        if (empty($key)) {
            if (empty($value)) {
                return $this;
            }

            $key = $value;
            $value = null;
        }

        $this->attributes[$key] = $value ?? true;

        return $this;
    }

    public function setBatch(array $batch): self
    {
        foreach ($batch as $key => $value) {
            $this->set($key, $value);
        }

        return $this;
    }

    public function remove(string $key): self
    {
        if (\array_key_exists($key, $this->attributes)) {
            unset($this->attributes[$key]);
        }

        return $this;
    }

    public function offsetExists(mixed $offset): bool
    {
        return \array_key_exists($offset, $this->attributes);
    }

    public function offsetGet(mixed $offset): mixed
    {
        return $this->attributes[$offset];
    }

    public function offsetSet(mixed $offset, mixed $value): void
    {
        $this->set($offset, $value);
    }

    public function offsetUnset(mixed $offset): void
    {
        $this->remove($offset);
    }

    public function count(): int
    {
        return \count($this->attributes);
    }
}
