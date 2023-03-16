<?php

namespace Solspace\Freeform\Events\Integrations;

use Solspace\Freeform\Library\Integrations\Types\CRM\CRMIntegrationInterface;

class FetchCrmTypesEvent extends FetchIntegrationTypesEvent
{
    protected function validateType(string $class): bool
    {
        $reflection = new \ReflectionClass($class);

        return $reflection->implementsInterface(CRMIntegrationInterface::class);
    }
}
