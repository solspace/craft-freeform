<?php
/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2022, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Library\Database;

use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;
use Solspace\Freeform\Library\Integrations\Types\PaymentGateways\PaymentGatewayIntegration;

interface PaymentGatewayHandlerInterface extends IntegrationHandlerInterface
{
    /**
     * Updates the fields of a given payment gateway.
     *
     * @param FieldObject[] $plans
     */
    public function updatePlans(PaymentGatewayIntegration $integration, array $plans): bool;

    /**
     * Returns all FieldObjects of a particular payment gateway.
     *
     * @return FieldObject[]
     */
    public function getPlans(PaymentGatewayIntegration $integration): array;
}
