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

namespace Solspace\Freeform\Library\Database;

use Solspace\Freeform\Library\Exceptions\Integrations\ListNotFoundException;
use Solspace\Freeform\Library\Exceptions\Integrations\MailingListIntegrationNotFoundException;
use Solspace\Freeform\Library\Integrations\BaseIntegration;
use Solspace\Freeform\Library\Integrations\Types\MailingLists\DataObjects\ListObject;
use Solspace\Freeform\Library\Integrations\Types\MailingLists\MailingListIntegration;

interface MailingListHandlerInterface extends IntegrationHandlerInterface
{
    /**
     * Updates the mailing lists of a given mailing list integration.
     */
    public function updateLists(MailingListIntegration $integration, array $mailingLists): bool;

    /**
     * @return MailingListIntegration[]
     */
    public function getAllIntegrationObjects(): array;

    /**
     * @param int $id
     *
     * @return null|MailingListIntegration
     *
     * @throws MailingListIntegrationNotFoundException
     */
    public function getIntegrationObjectById($id);

    /**
     * Returns all ListObjects of a particular mailing list integration.
     *
     * @return ListObject[]
     */
    public function getLists(MailingListIntegration $integration): array;

    /**
     * @param int $id
     *
     * @throws ListNotFoundException
     */
    public function getListById(MailingListIntegration $integration, $id): ListObject;

    /**
     * Flag the given mailing list integration so that it's updated the next time it's accessed.
     */
    public function flagIntegrationForUpdating(BaseIntegration $integration);
}
