<?php

namespace Solspace\Freeform\Events\Integrations;

use Solspace\Freeform\Library\Integrations\Types\MailingLists\MailingListIntegrationInterface;

class FetchMailingListTypesEvent extends FetchIntegrationTypesEvent
{
    protected function validateType(string $class): bool
    {
        $reflection = new \ReflectionClass($class);

        $implementsInterface = $reflection->implementsInterface(MailingListIntegrationInterface::class);
        $isInstallable = $class::isInstallable();

        return $implementsInterface && $isInstallable;
    }
}
