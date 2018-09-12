<?php
/**
 * Freeform for Craft
 *
 * @package       Solspace:Freeform
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2016, Solspace, Inc.
 * @link          https://solspace.com/craft/freeform
 * @license       https://solspace.com/software/license-agreement
 */

namespace Solspace\Freeform\Library\Integrations\PaymentGateways;

use Solspace\Freeform\Library\Composer\Components\Properties\PaymentProperties;
use Solspace\Freeform\Library\DataObjects\PaymentDetails;
use Solspace\Freeform\Library\DataObjects\PlanDetails;
use Solspace\Freeform\Library\DataObjects\SubscriptionDetails;
use Solspace\Freeform\Library\Integrations\PaymentGateways\DataObjects\PlanObject;
use Solspace\FreeformPayments\Models\SubscriptionPlanModel;
//TODO: document
interface PaymentGatewayIntegrationInterface
{
    /**
     * @param PaymentDetails $paymentDetails
     * @param PaymentProperties $paymentProperties
     *
     * @return mixed
     */
    public function processPayment(PaymentDetails $paymentDetails, PaymentProperties $paymentProperties);

    /**
     * @param SubscriptionDetails $subscriptionDetails
     * @param PaymentProperties $paymentProperties
     *
     * @return mixed
     */
    public function processSubscription(SubscriptionDetails $subscriptionDetails, PaymentProperties $paymentProperties);

    /**
     * @return SubscriptionPlanModel[]
     */
    public function fetchPlans();

    /**
     * @param string $id
     *
     * @return SubscriptionPlanModel|null
     */
    public function fetchPlan(string $id);

    /**
     * @param PlanDetails $planDetails
     *
     * @return string|false
     */
    public function createPlan(PlanDetails $planDetails);
}
