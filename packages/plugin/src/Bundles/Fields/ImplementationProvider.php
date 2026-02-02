<?php

namespace Solspace\Freeform\Bundles\Fields;

use craft\helpers\StringHelper;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Interfaces\ExtraFieldInterface;
use Solspace\Freeform\Library\Serialization\Normalizers\IdentificatorInterface;

class ImplementationProvider
{
    private const EXCLUDED_INTERFACES = [
        FieldInterface::class,
        \JsonSerializable::class,
        \Stringable::class,
        IdentificatorInterface::class,
        ExtraFieldInterface::class,
    ];

    public function getImplementations(string $class): array
    {
        $reflection = new \ReflectionClass($class);
        $interfaces = $reflection->getInterfaces();

        return array_values(
            $this->cleanUpInterfaceNames(
                $this->filterExcludedInterfaces($interfaces)
            )
        );
    }

    public function getFromArray(array $implementations): array
    {
        return array_values(
            $this->cleanUpInterfaceNames(
                $this->filterExcludedInterfaces(
                    array_map(
                        static fn ($interface) => new \ReflectionClass($interface),
                        $implementations
                    )
                )
            )
        );
    }

    private function cleanUpInterfaceNames(array $interfaces): array
    {
        return array_map(
            static function ($interface) {
                $name = $interface->getShortName();
                $name = preg_replace(
                    '/Interface$/',
                    '',
                    $name,
                );

                preg_match('/^([A-Z]+)(?=[A-Z][a-z])/', $name, $matches);

                if (!empty($matches)) {
                    $match = $matches[1];
                    $name = str_replace($match, StringHelper::toLowerCase($match), $name);
                }

                return StringHelper::toCamelCase($name);
            },
            $interfaces
        );
    }

    private function filterExcludedInterfaces(array $interfaces): array
    {
        return array_filter(
            $interfaces,
            static fn ($interfaceReflection) => !\in_array(
                $interfaceReflection->getName(),
                self::EXCLUDED_INTERFACES,
                true
            )
        );
    }
}
