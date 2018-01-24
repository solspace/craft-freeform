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

namespace Solspace\Freeform\Library\Mailing;

interface NotificationInterface
{
    /**
     * @return string
     */
    public function getHandle(): string;

    /**
     * @return string
     */
    public function getFromName(): string;

    /**
     * @return string
     */
    public function getFromEmail(): string;

    /**
     * @return string|null
     */
    public function getReplyToEmail();

    /**
     * @return bool
     */
    public function isIncludeAttachmentsEnabled(): bool;

    /**
     * @return string
     */
    public function getSubject(): string;

    /**
     * @return string
     */
    public function getBodyHtml(): string;

    /**
     * @return string
     */
    public function getBodyText(): string;
}
