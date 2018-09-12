<?php
/**
 * Freeform for Craft
 *
 * @package       Solspace:Freeform
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2018, Solspace, Inc.
 * @link          https://solspace.com/craft/freeform
 * @license       https://solspace.com/software/license-agreement
 */

namespace Solspace\Freeform\Library\DataObjects;

class SubscriptionDetails
{
    /** @var string */
    private $token;

    /** @var string */
    private $plan;

    /** @var int */
    private $submissionId;

    /**
     * @var CustomerDetails
     */
    private $customer;

    /**
     * PaymentDetails constructor.
     * @param string $token
     * @param string $plan
     * @param int $submissionId
     */
    public function __construct(string $token, string $plan, int $submissionId, CustomerDetails $customer)
    {
        $this->token = $token;
        $this->plan = $plan;
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
     * @return string
     */
    public function getPlan(): string
    {
        return $this->plan;
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
