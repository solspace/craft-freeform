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
namespace Solspace\Freeform\Variables;

use Solspace\Freeform\Freeform;
use Solspace\Freeform\Models\Pro\Payments\PaymentModel;
use Solspace\Freeform\Services\Pro\Payments\PaymentsService;

/**
 * Class FreeformPaymentsVariable
 *
 * @package Solspace\Freeform\Variables
 * @deprecated Use the Freeform variable from now on
 */
class FreeformPaymentsVariable
{
    /**
     * @param string|int $submissionId
     *
     * @return null|PaymentModel
     */
    public function payments($submissionId)
    {
        return $this->getPaymentsService()->getPaymentDetails((int) $submissionId);
    }

    /**
     * Returns payments service
     *
     * @return PaymentsService
     */
    private function getPaymentsService(): PaymentsService
    {
        return Freeform::getInstance()->payments;
    }
}
