<?php

namespace Solspace\Freeform\Models\Pro\Payments;

use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Payments\PaymentInterface;

class SubscriptionModel extends AbstractPaymentModel
{
    /** @var int */
    public $planId;

    /** @var float */
    public $amount;

    /** @var string */
    public $currency;

    /** @var string */
    public $interval;

    /** @var int */
    public $intervalCount;

    /** @var int */
    public $last4;

    /** @var SubscriptionPlanModel */
    protected $plan;

    /**
     * @inheritDoc
     */
    public function getType(): string
    {
        return PaymentInterface::TYPE_SUBSCRIPTION;
    }

    /**
     * Returns subscription's plan
     *
     * @return SubscriptionPlanModel
     */
    public function getPlan()
    {
        if (!$this->plan && $this->planId) {
            $this->plan = Freeform::getInstance()->subscriptionPlans->getById($this->planId);
        }

        return $this->plan;
    }

    /**
     * Returns URL that will cancel subscription if visited
     *
     * @return string
     */
    public function getUnsubscribeUrl(): string
    {
        $id = $this->getId();
        $resourceId = $this->resourceId;
        $validationKey = sha1($resourceId);

        return \Craft::getAlias("@web/freeform/payment-subscription/$id/cancel/$validationKey");
    }

    /**
     * Returns name of subscription plan
     *
     * @return string
     */
    public function getPlanName(): string
    {
        return $this->getPlan()->name;
    }
}
