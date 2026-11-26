<?php

namespace Solspace\Freeform\Library\Integrations;

use Solspace\Freeform\Library\Integrations\Types\Elements\ElementIntegrationInterface;
use Solspace\Freeform\Library\Integrations\Types\Other\GoogleSheetsIntegrationInterface;
use Solspace\Freeform\Library\Integrations\Types\PaymentGateways\PaymentGatewayIntegrationInterface;
use Solspace\Freeform\Library\Integrations\Types\Webhooks\WebhookIntegrationInterface;

final class DeliveryIntegrations
{
    public static function includes(string $class): bool
    {
        foreach ([
            PushableInterface::class,
            ElementIntegrationInterface::class,
            GoogleSheetsIntegrationInterface::class,
            PaymentGatewayIntegrationInterface::class,
            WebhookIntegrationInterface::class,
        ] as $interface) {
            if (is_a($class, $interface, true)) {
                return true;
            }
        }

        return false;
    }
}
