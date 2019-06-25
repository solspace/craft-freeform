<?php
/**
 * Freeform for Craft
 *
 * @package       Solspace:Freeform
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2019, Solspace, Inc.
 * @link          https://docs.solspace.com/craft/freeform
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Library\Database;

use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;
use Solspace\Freeform\Library\Integrations\PaymentGateways\AbstractPaymentGatewayIntegration;

interface PaymentGatewayHandlerInterface extends IntegrationHandlerInterface
{
    /**
     * Updates the fields of a given payment gateway
     *
     * @param AbstractPaymentGatewayIntegration $integration
     * @param FieldObject[]          $plans
     *
     * @return bool
     */
    public function updatePlans(AbstractPaymentGatewayIntegration $integration, array $plans): bool;

    /**
     * Returns all FieldObjects of a particular payment gateway
     *
     * @param AbstractPaymentGatewayIntegration $integration
     *
     * @return FieldObject[]
     */
    public function getPlans(AbstractPaymentGatewayIntegration $integration): array;
}
