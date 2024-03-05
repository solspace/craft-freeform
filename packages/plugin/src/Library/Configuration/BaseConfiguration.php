<?php

namespace Solspace\Freeform\Library\Configuration;

use Solspace\Freeform\Library\Exceptions\Configurations\ConfigurationException;

abstract class BaseConfiguration
{
    /**
     * BaseConfiguration constructor.
     * Passing an array config populates all of the configuration values for a given configuration.
     *
     * @throws ConfigurationException
     */
    public function __construct(array $config = null)
    {
        if (null === $config) {
            return;
        }

        foreach ($config as $key => $value) {
            if (property_exists(static::class, $key)) {
                $this->{$key} = $value;
            } else {
                $reflection = new \ReflectionClass($this);
                $properties = $reflection->getProperties(
                    \ReflectionProperty::IS_PUBLIC | \ReflectionProperty::IS_PROTECTED
                );

                $availableProperties = [];
                foreach ($properties as $property) {
                    $availableProperties[] = $property->getName();
                }

                throw new ConfigurationException(
                    sprintf(
                        'Configuration property "%s" does not exist. Available properties are: "%s"',
                        $key,
                        implode(', ', $availableProperties)
                    )
                );
            }
        }
    }

    public function __toString(): string
    {
        return $this->getConfigHash();
    }

    /**
     * Returns the SHA1 hash of the serialized object.
     */
    public function getConfigHash(): string
    {
        return sha1(serialize($this));
    }

    protected function castToInt($value, bool $nullable = true): ?int
    {
        if (null === $value && $nullable) {
            return null;
        }

        return (int) $value;
    }

    protected function castToString(mixed $value, bool $nullable = true): ?string
    {
        if (null === $value && $nullable) {
            return null;
        }

        return (string) $value;
    }

    protected function castToBool(mixed $value, bool $nullable = true): ?bool
    {
        if (null === $value && $nullable) {
            return null;
        }

        return (bool) $value;
    }

    protected function castToArray($value, bool $nullable = true): ?array
    {
        if (null === $value) {
            return $nullable ? null : [];
        }

        if (!\is_array($value)) {
            return '' === $value ? [] : [$value];
        }

        return $value;
    }
}
