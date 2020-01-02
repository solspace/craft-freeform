<?php
/**
 * Freeform for Craft
 *
 * @package       Solspace:Freeform
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2020, Solspace, Inc.
 * @link          https://docs.solspace.com/craft/freeform
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Library\Integrations\PaymentGateways;

use Solspace\Freeform\Library\Composer\Components\Properties\PaymentProperties;
use Solspace\Freeform\Library\DataObjects\PaymentDetails;
use Solspace\Freeform\Library\DataObjects\PlanDetails;
use Solspace\Freeform\Library\DataObjects\SubscriptionDetails;
use Solspace\Freeform\Models\Pro\Payments\SubscriptionPlanModel;
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
