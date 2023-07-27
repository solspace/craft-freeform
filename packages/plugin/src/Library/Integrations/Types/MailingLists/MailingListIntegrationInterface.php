<?php
/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2022, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Library\Integrations\Types\MailingLists;

use Solspace\Freeform\Library\Integrations\Types\MailingLists\DataObjects\ListObject;

interface MailingListIntegrationInterface
{
    public static function isInstallable(): bool;

    /**
     * Push emails to a specific mailing list for the service provider.
     *
     * @param array $mappedValues - key => value pairs of integrations fields against form fields
     *
     * @return bool
     */
    public function pushEmails(ListObject $mailingList, array $emails, array $mappedValues);
}
