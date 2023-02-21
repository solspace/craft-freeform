<?php

namespace Solspace\Freeform\Library\Attributes;

class Attributes implements \Countable, \JsonSerializable
{
    private array $attributes = [];

    public function __construct(array $attributes = [])
    {
        $this->setBatch($attributes);
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

        return implode(' ', $stringArray);
    }

    public function get(int $index, mixed $default = null): ?array
    {
        return $this->attributes[$index] ?? $default;
    }

    public function set(?string $key, mixed $value = null): self
    {
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

    public function count(): int
    {
        return \count($this->attributes);
    }

    public function jsonSerialize(): array
    {
        return $this->attributes;
    }
}
