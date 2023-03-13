<?php

namespace Solspace\Freeform\Bundles\Fields;

use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Interfaces\ExtraFieldInterface;
use Solspace\Freeform\Fields\Interfaces\MultipleValueInterface;
use Solspace\Freeform\Fields\Interfaces\SingleValueInterface;
use Stringy\Stringy;

class ImplementationProvider
{
    private const EXCLUDED_INTERFACES = [
        FieldInterface::class,
        \JsonSerializable::class,
        \Stringable::class,
        ExtraFieldInterface::class,
        SingleValueInterface::class,
        MultipleValueInterface::class,
    ];

    public function getImplementations(string $class): array
    {
        $reflection = new \ReflectionClass($class);
        $interfaces = $reflection->getInterfaces();

        return array_values(
            $this->cleanUpInterfaceNames(
                $this->filterExcludedInterfaces(
                    $interfaces
                )
            )
        );
    }

    private function cleanUpInterfaceNames(array $interfaces): array
    {
        return array_map(
            fn ($interface) => preg_replace(
                '/Interface$/',
                '',
                Stringy::create($interface->getShortName())->camelize()
            ),
            $interfaces
        );
    }

    private function filterExcludedInterfaces(array $interfaces): array
    {
        return array_filter(
            $interfaces,
            fn ($interfaceReflection) => !\in_array(
                $interfaceReflection->getName(),
                self::EXCLUDED_INTERFACES,
                true
            )
        );
    }
}
