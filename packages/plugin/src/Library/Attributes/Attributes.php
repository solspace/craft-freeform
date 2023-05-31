<?php

namespace Solspace\Freeform\Library\Attributes;

class Attributes implements \Countable, \JsonSerializable
{
    private array $attributes = [];

    public function __construct(array $attributes = [])
    {
        foreach ($attributes as $key => $value) {
            $this->set($key, $value);
        }
    }

    public function __toString(): string
    {
        $stringArray = [];

        foreach ($this->attributes as [$key, $value]) {
            if (empty($key) && !empty($value)) {
                $key = $value;
                $value = '';
            }

            if ((!$key && !$value) || false === $value) {
                continue;
            }

            $key = htmlspecialchars($key, \ENT_QUOTES, 'UTF-8');

            if (true === $value || '' === $value || null === $value) {
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

        if (empty($stringArray)) {
            return '';
        }

        return ' '.implode(' ', $stringArray);
    }

    public function find(string $key): mixed
    {
        foreach ($this->attributes as $index => [$existingKey, $existingValue]) {
            if ($existingKey === $key) {
                return $existingValue;
            }
        }

        return null;
    }

    public function get(string $name, mixed $default = null): mixed
    {
        foreach ($this->attributes as [$key, $value]) {
            if ($key === $name) {
                return $value;
            }
        }

        return $default;
    }

    public function set(?string $key, mixed $value = null): self
    {
        $this->attributes[] = [$key, $value];

        return $this;
    }

    public function setIfEmpty(?string $key, mixed $value = null): self
    {
        foreach ($this->attributes as $index => [$existingKey, $existingValue]) {
            if ($existingKey === $key) {
                return $this;
            }
        }

        $this->attributes[] = [$key, $value];

        return $this;
    }

    public function replace(string $key, mixed $value = null): self
    {
        $reversed = array_reverse($this->attributes, true);
        foreach ($reversed as $index => [$existingKey, $existingValue]) {
            if ($existingKey === $key) {
                $this->attributes[$index][1] = $value;

                return $this;
            }
        }

        $this->attributes[] = [$key, $value];

        return $this;
    }

    public function append(string $key, mixed $value = null): self
    {
        $reversed = array_reverse($this->attributes, true);
        foreach ($reversed as $index => [$existingKey, $existingValue]) {
            if ($existingKey === $key) {
                $this->attributes[$index][1] = $existingValue.' '.$value;

                return $this;
            }
        }

        $this->attributes[] = [$key, $value];

        return $this;
    }

    public function setBatch(array $batch): self
    {
        foreach ($batch as [$key, $value]) {
            $this->set($key, $value);
        }

        return $this;
    }

    public function remove(int $index): self
    {
        unset($this->attributes[$index]);

        return $this;
    }

    public function clone(): self
    {
        return clone $this;
    }

    public function count(): int
    {
        return \count($this->attributes);
    }

    public function toArray(): array
    {
        return $this->attributes;
    }

    public function jsonSerialize(): array
    {
        return $this->attributes;
    }
}
