<?php
/**
 * Freeform for Craft
 *
 * @package       Solspace:Freeform
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2016, Solspace, Inc.
 * @link          https://solspace.com/craft/freeform
 * @license       https://solspace.com/software/license-agreement
 */

namespace Solspace\Freeform\Library\Composer\Components\Fields\Interfaces;

interface RecipientInterface
{
    /**
     * Returns an array value of all possible recipient Email addresses
     *
     * Either returns an ["email", "email"] array
     * Or an array with keys as recipient names, like ["Jon Doe" => "email", ..]
     *
     * @return array
     */
    public function getRecipients();

    /**
     * @return int|null
     */
    public function getNotificationId();

    /**
     * Returns true/false based on if the field should or should not act
     * as a recipient email field and receive emails
     *
     * @return bool
     */
    public function shouldReceiveEmail();
}
