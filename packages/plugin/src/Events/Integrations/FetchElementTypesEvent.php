<?php

namespace Solspace\Freeform\Events\Integrations;

use Solspace\Freeform\Library\Integrations\Types\Elements\ElementIntegrationInterface;

class FetchElementTypesEvent extends FetchIntegrationTypesEvent
{
    protected function validateType(string $class): bool
    {
        $reflection = new \ReflectionClass($class);

        return $reflection->implementsInterface(ElementIntegrationInterface::class);
    }
}
