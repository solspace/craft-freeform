<?php

namespace Solspace\Freeform\Bundles\Integrations\Providers;

use craft\helpers\StringHelper;
use Psr\Log\LoggerInterface;
use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Integrations\IntegrationInterface;

class IntegrationLoggerProvider
{
    public function __construct(private IntegrationTypeProvider $typeProvider) {}

    public function getLogger(IntegrationInterface|string|Type $integration): LoggerInterface
    {
        if ($integration instanceof IntegrationInterface) {
            $type = $integration->getTypeDefinition();
        } elseif ($integration instanceof Type) {
            $type = $integration;
        } else {
            $type = $this->typeProvider->getTypeDefinition($integration);
        }

        $logCategory = StringHelper::toKebabCase($type->getNameWithVersion());

        return Freeform::getInstance()
            ->logger
            ->getLogger(
                $logCategory,
                'integrations'
            )
        ;
    }
}
