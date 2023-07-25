<?php

namespace Solspace\Freeform\controllers\integrations\payments;

use Solspace\Freeform\controllers\integrations\IntegrationsController;
use Solspace\Freeform\Library\Integrations\IntegrationInterface;
use Solspace\Freeform\Models\IntegrationModel;

class GatewaysController extends IntegrationsController
{
    protected function getTitle(): string
    {
        return 'Payment Gateways';
    }

    protected function getType(): string
    {
        return 'payment-gateways';
    }

    protected function getIntegrationType(): string
    {
        return IntegrationInterface::TYPE_PAYMENT_GATEWAY;
    }

    protected function getAction(): string
    {
        return 'payments/gateways';
    }

    protected function getIntegrationModels(): array
    {
        return $this->getPaymentGatewaysService()->getAllIntegrations();
    }

    protected function getServiceProviderTypes(): array
    {
        return $this->getPaymentGatewaysService()->getAllServiceProviders();
    }

    protected function getRenderVariables(IntegrationModel $model): array
    {
        return ['webhookUrl' => $model->id ? $model->getIntegrationObject()->getWebhookUrl() : ''];
    }

    protected function getNewOrExistingModel(int|string|null $id): IntegrationModel
    {
        if (is_numeric($id)) {
            $paymentGateway = $this->getPaymentGatewaysService()->getIntegrationById($id);
        } else {
            $paymentGateway = $this->getPaymentGatewaysService()->getIntegrationByHandle($id);
        }

        if (!$paymentGateway) {
            $paymentGateway = IntegrationModel::create(IntegrationInterface::TYPE_PAYMENT_GATEWAY);
        }

        return $paymentGateway;
    }
}
