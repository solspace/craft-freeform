<?php

namespace Solspace\Freeform\Models\Pro\Payments;

use Solspace\Freeform\Library\Payments\PaymentInterface;

class PaymentModel extends AbstractPaymentModel
{
    /** @var int */
    public $subscriptionId;

    /** @var float */
    public $amount;

    /** @var string */
    public $currency;

    /** @var int */
    public $last4;

    /**
     * {@inheritDoc}
     */
    public function getType(): string
    {
        return PaymentInterface::TYPE_SINGLE;
    }
}
