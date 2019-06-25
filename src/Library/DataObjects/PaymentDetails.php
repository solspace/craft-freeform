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

namespace Solspace\Freeform\Library\DataObjects;

class PaymentDetails
{
    /** @var string */
    private $token;

    /** @var float */
    private $amount;

    /** @var string */
    private $currency;

    /** @var int */
    private $submissionId;

    /**
     * @var CustomerDetails
     */
    private $customer;

    /**
     * PaymentDetails constructor.
     * @param string $token
     * @param float $amount
     * @param string $currency
     * @param int $submissionId
     */
    public function __construct(
        string $token,
        float $amount,
        string $currency,
        int $submissionId,
        CustomerDetails $customer
    ) {
        $this->token = $token;
        $this->amount = $amount;
        $this->currency = $currency;
        $this->submissionId = $submissionId;
        $this->customer = $customer;
    }

    /**
     * @return string
     */
    public function getToken(): string
    {
        return $this->token;
    }

    /**
     * @return float
     */
    public function getAmount(): float
    {
        return $this->amount;
    }

    /**
     * @return string
     */
    public function getCurrency(): string
    {
        return $this->currency;
    }

    /**
     * @return int
     */
    public function getSubmissionId(): int
    {
        return $this->submissionId;
    }

    /**
     * Get the value of customer
     *
     * @return CustomerDetails
     */
    public function getCustomer()
    {
        return $this->customer;
    }
}
