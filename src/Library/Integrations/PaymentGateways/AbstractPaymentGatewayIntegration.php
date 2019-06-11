<?php
/**
 * Freeform for Craft
 *
 * @package       Solspace:Freeform
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2019, Solspace, Inc.
 * @link          http://docs.solspace.com/craft/freeform
 * @license       https://solspace.com/software/license-agreement
 */

namespace Solspace\Freeform\Library\Integrations\PaymentGateways;

use Psr\Log\LoggerInterface;
use Solspace\Freeform\Library\Configuration\ConfigurationInterface;
use Solspace\Freeform\Library\Database\PaymentGatewayHandlerInterface;
use Solspace\Freeform\Library\DataObjects\PlanDetails;
use Solspace\Freeform\Library\Integrations\AbstractIntegration;
use Solspace\Freeform\Library\Integrations\IntegrationInterface;
use Solspace\Freeform\Library\Integrations\PaymentGateways\DataObjects\PlanObject;
use Solspace\Freeform\Library\Translations\TranslatorInterface;

abstract class AbstractPaymentGatewayIntegration extends AbstractIntegration implements PaymentGatewayIntegrationInterface, IntegrationInterface, \JsonSerializable
{
    const TYPE = 'payment_gateway';

    /**
     * Payment Gateway service
     *
     * @var PaymentGatewayHandlerInterface
     */
    private $paymentGatewayHandler;

    /**
     * AbstractPaymentGatewayIntegration constructor.
     *
     * @param int                            $id
     * @param string                         $name
     * @param \DateTime                      $lastUpdate
     * @param string                         $accessToken
     * @param array|null                     $settings
     * @param LoggerInterface                $logger
     * @param ConfigurationInterface         $configuration
     * @param TranslatorInterface            $translator
     * @param PaymentGatewayHandlerInterface $paymentGatewayHandler
     */
    final public function __construct(
        $id,
        $name,
        \DateTime $lastUpdate,
        $accessToken,
        $settings,
        LoggerInterface $logger,
        ConfigurationInterface $configuration,
        TranslatorInterface $translator,
        PaymentGatewayHandlerInterface $paymentGatewayHandler
    ) {
        parent::__construct(
            $id,
            $name,
            $lastUpdate,
            $accessToken,
            $settings,
            $logger,
            $configuration,
            $translator,
            $paymentGatewayHandler
        );

        $this->paymentGatewayHandler = $paymentGatewayHandler;
    }

    /**
     * @inheritDoc
     */
    public function isOAuthConnection(): bool
    {
        return false;
    }

    /**
     * Retuns list of available payment plans
     *
     * @return PlanObject[]
     */
    final public function getPlans(): array
    {
        return $this->fetchPlans();
    }

    /**
     * Fetch subscription plans from the integration
     *
     * @return PlanObject[]
     */
    abstract public function fetchPlans(): array;

    /**
     * Creates subscription plan on the integration
     *
     * @param PlanDetails $plan
     *
     * @return string|false
     */
    abstract public function createPlan(PlanDetails $plan);

    /**
     * Fetches plan from integration
     *
     * @param string $id
     *
     * @return PlanObject
     */
    abstract public function fetchPlan(string $id);

    /**
     * Returns list of fields that can be provided to charge/subscribe functions
     *
     * @return string[]
     */
    abstract public function fetchFields(): array;

    /**
     * Returns all details of single payment
     *
     * @param int $submissionId
     *
     * @return array
     */
    abstract public function getPaymentDetails(int $submissionId);

    /**
     * Specify data which should be serialized to JSON
     *
     * @return array
     */
    public function jsonSerialize(): array
    {
        try {
            $plans = $this->getPlans();
        } catch (\Exception $e) {
            $this->getLogger()->error($e->getMessage(), ['service' => $this->getServiceProvider()]);

            $plans = [];
        }

        return [
            'id'     => $this->getId(),
            'name'   => $this->getName(),
            'plans'  => $plans,
            'fields' => $this->fetchFields(),
        ];
    }
}
