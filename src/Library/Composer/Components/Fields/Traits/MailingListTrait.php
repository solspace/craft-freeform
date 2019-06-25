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

namespace Solspace\Freeform\Library\Composer\Components\Fields\Traits;

trait MailingListTrait
{
    /** @var int */
    protected $integrationId;

    /** @var string */
    protected $resourceId;

    /** @var string */
    protected $emailFieldHash;

    /**
     * @return int
     */
    public function getIntegrationId(): int
    {
        return $this->integrationId;
    }

    /**
     * @return string
     */
    public function getResourceId(): string
    {
        return $this->resourceId;
    }

    /**
     * @return string
     */
    public function getEmailFieldHash(): string
    {
        return $this->emailFieldHash;
    }
}
