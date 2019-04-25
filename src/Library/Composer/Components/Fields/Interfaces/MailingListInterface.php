<?php
/**
 * Freeform for Craft
 *
 * @package       Solspace:Freeform
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2019, Solspace, Inc.
 * @link          https://solspace.com/craft/freeform
 * @license       https://solspace.com/software/license-agreement
 */

namespace Solspace\Freeform\Library\Composer\Components\Fields\Interfaces;

interface MailingListInterface
{
    /**
     * @return int
     */
    public function getIntegrationId(): int;

    /**
     * @return string
     */
    public function getResourceId(): string;

    /**
     * @return string
     */
    public function getEmailFieldHash(): string;

    /**
     * @return array
     */
    public function getMapping(): array;
}
