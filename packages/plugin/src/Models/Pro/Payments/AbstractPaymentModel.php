<?php

namespace Solspace\Freeform\Models\Pro\Payments;

use craft\base\Model;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Integrations\PaymentGateways\PaymentGatewayIntegrationInterface;
use Solspace\Freeform\Library\Payments\PaymentInterface;

abstract class AbstractPaymentModel extends Model implements PaymentInterface
{
    /** @var int */
    public $id;

    /** @var int */
    public $submissionId;

    /** @var int */
    public $integrationId;

    /** @var string */
    public $resourceId;

    /** @var string */
    public $status;

    /** @var int */
    public $errorCode;

    /** @var string */
    public $errorMessage;

    /** @var array */
    public $metadata;

    public $dateCreated;
    public $dateUpdated;
    public $uid;

    /** @var PaymentGatewayIntegrationInterface */
    protected $integration;

    public function getId()
    {
        return $this->id;
    }

    /**
     * {@inheritDoc}
     */
    abstract public function getType(): string;

    /**
     * Returns payment gateway integration.
     *
     * @return null|PaymentGatewayIntegrationInterface
     */
    public function getIntegration()
    {
        if (!$this->integration) {
            $paymentGateways = Freeform::getInstance()->paymentGateways;
            $this->integration = $paymentGateways->getIntegrationObjectById($this->integrationId);
        }

        return $this->integration;
    }

    /**
     * Returns user assigned integration name.
     */
    public function getIntegrationName(): string
    {
        $integration = $this->getIntegration();
        if (!$integration) {
            return '';
        }

        return $integration->getName();
    }

    /**
     * Returns user assigned integration name.
     */
    public function getServiceProvider(): string
    {
        $integration = $this->getIntegration();
        if (!$integration) {
            return '';
        }

        return $integration->getServiceProvider();
    }

    public function getExternalDashboardLink(): string
    {
        $integration = $this->getIntegration();
        if (!$integration || !$this->resourceId) {
            return '';
        }

        return $integration->getExternalDashboardLink($this->resourceId, $this->getType());
    }

    public function getCard(): string
    {
        return $this->last4 ?: '';
    }

    public function getGateway(): string
    {
        return $this->getIntegrationName();
    }
}
