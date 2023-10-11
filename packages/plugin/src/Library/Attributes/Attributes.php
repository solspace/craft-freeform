<?php

namespace Solspace\Freeform\Library\Attributes;

use Solspace\Commons\Helpers\StringHelper;
use Solspace\Freeform\Library\Serialization\Normalizers\CustomNormalizerInterface;
use Symfony\Component\Serializer\Annotation\Ignore;

class Attributes implements CustomNormalizerInterface, \Countable, \JsonSerializable, \IteratorAggregate
{
    public const STRATEGY_APPEND = 'append';
    public const STRATEGY_REMOVE = 'remove';
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

            if (true === $value || null === $value) {
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

    public function getNested(string $name): ?array
    {
        return null;
    }

    public function set(string $key, mixed $value = null, string $strategy = self::STRATEGY_APPEND): self
    {
        preg_match('/^[=+-]/', $key, $matches);
        if ($matches) {
            $prefix = $matches[0];
            match ($prefix) {
                '=' => $strategy = self::STRATEGY_REPLACE,
                '+' => $strategy = self::STRATEGY_APPEND,
                '-' => $strategy = self::STRATEGY_REMOVE,
            };

            $key = substr($key, 1);
        }

        if (\is_array($value)) {
            $value = array_map(
                function ($item) {
                    if (\is_string($item)) {
                        $item = trim($item);
                    }

                    return $item;
                },
                $value
            );
            $value = array_filter($value);
            $value = StringHelper::implodeRecursively(' ', $value);
        }

        if (\is_string($value)) {
            $value = trim($value);
        }

        switch ($strategy) {
            case self::STRATEGY_REPLACE:
                $this->attributes[$key] = $value;

                break;

            case self::STRATEGY_REMOVE:
                if (\is_string($value)) {
                    $removable = explode(' ', $value);
                } elseif (!\is_array($value)) {
                    $removable = [$value];
                } else {
                    $removable = $value;
                }

                $removable = array_map('trim', $removable);

                $attributes = explode(' ', $this->attributes[$key] ?? '');
                $attributes = array_filter($attributes, fn ($attribute) => !\in_array($attribute, $removable, true));
                $this->attributes[$key] = implode(' ', $attributes);

                if (empty($this->attributes[$key])) {
                    unset($this->attributes[$key]);
                }

                break;

            case self::STRATEGY_APPEND:
            default:
                if (\array_key_exists($key, $this->attributes) && !\is_bool($value)) {
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

    public function merge(array|self $attributes): self
    {
        $reflection = new \ReflectionClass($this);

        if ($attributes instanceof self) {
            foreach ($attributes->attributes as $key => $value) {
                $this->set($key, $value);
            }

            foreach ($this->getSubAttributes() as $name => $nestedAttribute) {
                $item = $attributes->{$name} ?? null;
                if ($item instanceof self) {
                    $nestedAttribute->merge($item);
                }
            }

            return $this;
        }

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

    #[Ignore]
    public function normalize(): array
    {
        return $this->toArray();
    }

    public function jsonSerialize(): object
    {
        return (object) $this->toArray();
    }

    public function getIterator(): \ArrayIterator
    {
        return new \ArrayIterator($this->attributes);
    }

    private function getSubAttributes(): array
    {
        $reflection = new \ReflectionClass($this);
        $attributes = [];

        foreach ($reflection->getProperties() as $property) {
            $type = $property->getType();
            if ($type && self::class === $type->getName()) {
                $attributes[$property->getName()] = $this->{$property->getName()};
            }
        }

        return $attributes;
    }
}
