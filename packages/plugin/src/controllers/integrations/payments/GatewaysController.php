<?php

namespace Solspace\Freeform\controllers\integrations\payments;

use Solspace\Freeform\controllers\integrations\IntegrationsController;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Integrations\IntegrationInterface;
use Solspace\Freeform\Services\Integrations\AbstractIntegrationService;

class GatewaysController extends IntegrationsController
{
    protected function getTitle(): string
    {
        return 'Payment Gateways';
    }

    protected function getTypeShorthand(): string
    {
        return IntegrationInterface::TYPE_PAYMENT_GATEWAYS;
    }

    protected function getAction(): string
    {
        return 'payments/gateways';
    }

    protected function getDedicatedService(): AbstractIntegrationService
    {
        return Freeform::getInstance()->paymentGateways;
    }
}
