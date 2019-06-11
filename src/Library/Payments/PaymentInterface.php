<?php
/**
 * Freeform for Craft
 *
 * @package   Solspace:Freeform
 * @author    Solspace, Inc.
 * @copyright Copyright (c) 2008-2019, Solspace, Inc.
 * @link      http://docs.solspace.com/craft/freeform
 * @license   https://solspace.com/software/license-agreement
 */

namespace Solspace\Freeform\Library\Payments;

interface PaymentInterface
{
    const TYPE_SINGLE       = 'single';
    const TYPE_SUBSCRIPTION = 'subscription';

    /**
     * Returns type of payment
     *
     * @return string
     */
    public function getType(): string;
}
