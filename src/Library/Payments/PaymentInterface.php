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
