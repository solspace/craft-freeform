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

namespace Solspace\Freeform\Library\Database;

use Solspace\Freeform\Library\Exceptions\Integrations\ListNotFoundException;
use Solspace\Freeform\Library\Exceptions\Integrations\MailingListIntegrationNotFoundException;
use Solspace\Freeform\Library\Integrations\AbstractIntegration;
use Solspace\Freeform\Library\Integrations\MailingLists\AbstractMailingListIntegration;
use Solspace\Freeform\Library\Integrations\MailingLists\DataObjects\ListObject;

interface MailingListHandlerInterface extends IntegrationHandlerInterface
{
    /**
     * Updates the mailing lists of a given mailing list integration
     *
     * @param AbstractMailingListIntegration $integration
     * @param array                          $mailingLists
     *
     * @return bool
     */
    public function updateLists(AbstractMailingListIntegration $integration, array $mailingLists): bool;

    /**
     * @return AbstractMailingListIntegration[]
     */
    public function getAllIntegrationObjects(): array;

    /**
     * @param int $id
     *
     * @return AbstractMailingListIntegration|null
     * @throws MailingListIntegrationNotFoundException
     */
    public function getIntegrationObjectById($id);

    /**
     * Returns all ListObjects of a particular mailing list integration
     *
     * @param AbstractMailingListIntegration $integration
     *
     * @return ListObject[]
     */
    public function getLists(AbstractMailingListIntegration $integration): array;

    /**
     * @param AbstractMailingListIntegration $integration
     * @param int                            $id
     *
     * @return ListObject
     * @throws ListNotFoundException
     */
    public function getListById(AbstractMailingListIntegration $integration, $id): ListObject;

    /**
     * Flag the given mailing list integration so that it's updated the next time it's accessed
     *
     * @param AbstractIntegration $integration
     */
    public function flagIntegrationForUpdating(AbstractIntegration $integration);
}
