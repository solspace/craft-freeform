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

use Solspace\Freeform\Elements\Submission;

class SubscriptionDetails
{
    /** @var string */
    private $token;

    /** @var Submission */
    private $submission;

    /**
     * PaymentDetails constructor.
     *
     * @param string     $token
     * @param Submission $submission
     */
    public function __construct(string $token, Submission $submission)
    {
        $this->token      = $token;
        $this->submission = $submission;
    }

    /**
     * @return string
     */
    public function getToken(): string
    {
        return $this->token;
    }

    /**
     * @return Submission
     */
    public function getSubmission(): Submission
    {
        return $this->submission;
    }
}
