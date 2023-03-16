<?php

namespace Solspace\Freeform\Events\Integrations;

use Solspace\Freeform\Library\Integrations\Types\PaymentGateways\PaymentGatewayIntegrationInterface;

class FetchPaymentGatewayTypesEvent extends FetchIntegrationTypesEvent
{
    protected function validateType(string $class): bool
    {
        $reflection = new \ReflectionClass($class);

        return $reflection->implementsInterface(PaymentGatewayIntegrationInterface::class);
    }
}
