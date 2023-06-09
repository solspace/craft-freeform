<?php

namespace Solspace\Freeform\Library\Attributes;

class Attributes implements \Countable, \JsonSerializable
{
    public const STRATEGY_APPEND = 'append';
    public const STRATEGY_REPLACE = 'replace';

    private array $attributes = [];

    public function __construct(array $attributes = [])
    {
        $this->merge($attributes);
    }

    public function __toString(): string
    {
        $stringArray = [];

        foreach ($this->attributes as $key => $value) {
            if (empty($key)) {
                continue;
            }

            if (false === $value) {
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

            $value = trim($value);
            $value = htmlspecialchars($value, \ENT_QUOTES, 'UTF-8');

            $stringArray[] = "{$key}=\"{$value}\"";
        }

        $stringArray = array_filter($stringArray);

        if (empty($stringArray)) {
            return '';
        }

        return ' '.implode(' ', $stringArray);
    }

    public function get(string $name, mixed $default = null): mixed
    {
        return $this->attributes[$name] ?? $default;
    }

    public function set(string $key, mixed $value = null, string $strategy = self::STRATEGY_APPEND): self
    {
        if (str_starts_with($key, '-')) {
            $strategy = self::STRATEGY_REPLACE;
            $key = substr($key, 1);
        }

        if (\is_array($value)) {
            $value = array_map('trim', $value);
            $value = array_filter($value);
            $value = implode(' ', $value);
        }

        switch ($strategy) {
            case self::STRATEGY_REPLACE:
                $this->attributes[$key] = $value;

                break;

            case self::STRATEGY_APPEND:
            default:
                if (\array_key_exists($key, $this->attributes)) {
                    $this->attributes[$key] = trim($this->attributes[$key].' '.$value);
                } else {
                    $this->attributes[$key] = $value;
                }

                break;
        }

        return $this;
    }

    public function setIfEmpty(?string $key, mixed $value = null): self
    {
        if (!\array_key_exists($key, $this->attributes)) {
            $this->attributes[$key] = $value;
        }

        return $this;
    }

    public function replace(string $key, mixed $value = null): self
    {
        return $this->set($key, $value, self::STRATEGY_REPLACE);
    }

    public function append(string $key, mixed $value = null): self
    {
        return $this->set($key, $value);
    }

    public function merge(array $attributes): self
    {
        $reflection = new \ReflectionClass($this);

        foreach ($reflection->getProperties() as $property) {
            if (!\array_key_exists($property->getName(), $attributes)) {
                continue;
            }

            if (!\is_array($attributes[$property->getName()])) {
                continue;
            }

            $type = $property->getType();
            if (!$type) {
                continue;
            }

            if (self::class !== $type->getName()) {
                continue;
            }

            $this->{$property->getName()}->merge($attributes[$property->getName()]);
            unset($attributes[$property->getName()]);
        }

        foreach ($attributes as $key => $value) {
            $this->set($key, $value);
        }

        return $this;
    }

    public function remove(string $key): self
    {
        unset($this->attributes[$key]);

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
        $reflection = new \ReflectionClass($this);
        $array = $this->attributes;

        foreach ($reflection->getProperties() as $property) {
            $type = $property->getType();
            if ($type && self::class === $type->getName()) {
                $array[$property->getName()] = $this->{$property->getName()}->jsonSerialize();
            }
        }

        return $array;
    }

    public function jsonSerialize(): array
    {
        return $this->toArray();
    }
}
