<?php
/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2021, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Variables;

use Solspace\Freeform\Freeform;
use Solspace\Freeform\Models\Pro\Payments\PaymentModel;
use Solspace\Freeform\Services\Pro\Payments\PaymentsService;

/**
 * Class FreeformPaymentsVariable.
 *
 * @deprecated Use the Freeform variable from now on
 */
class FreeformPaymentsVariable
{
    /**
     * @param int|string $submissionId
     *
     * @return null|PaymentModel
     */
    public function payments($submissionId)
    {
        return $this->getPaymentsService()->getPaymentDetails((int) $submissionId);
    }

    /**
     * Returns payments service.
     */
    private function getPaymentsService(): PaymentsService
    {
        return Freeform::getInstance()->payments;
    }
}
