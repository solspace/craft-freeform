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

use Solspace\Freeform\Library\Database\MailingListHandlerInterface;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;
use Solspace\Freeform\Library\Exceptions\Integrations\ListNotFoundException;
use Solspace\Freeform\Library\Integrations\AbstractIntegration;
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;
use Solspace\Freeform\Library\Integrations\IntegrationInterface;
use Solspace\Freeform\Library\Integrations\Types\MailingLists\DataObjects\ListObject;

abstract class AbstractMailingListIntegration extends AbstractIntegration implements MailingListIntegrationInterface, IntegrationInterface, \JsonSerializable
{
    public const TYPE = 'mailing_list';

    private MailingListHandlerInterface $mailingListHandler;

    /**
     * {@inheritDoc}
     */
    public static function isInstallable(): bool
    {
        return true;
    }

    /**
     * @return ListObject[]
     */
    final public function getLists(): array
    {
        if ($this->isForceUpdate()) {
            $lists = $this->fetchLists();
            $this->mailingListHandler->updateLists($this, $lists);
        } else {
            $lists = $this->mailingListHandler->getLists($this);
        }

        return $lists;
    }

    /**
     * @param string $listId
     *
     * @throws ListNotFoundException
     */
    final public function getListById($listId): ListObject
    {
        return $this->mailingListHandler->getListById($this, $listId);
    }

    /**
     * Specify data which should be serialized to JSON.
     */
    public function jsonSerialize(): array
    {
        try {
            $lists = $this->getLists();
        } catch (\Exception $e) {
            $lists = [];
        }

        return [
            'integrationId' => $this->getId(),
            'resourceId' => '',
            'type' => self::TYPE,
            'source' => $this->getServiceProvider(),
            'name' => $this->getName(),
            'label' => 'Opt-in mailing list "'.$this->getName().'"',
            'emailFieldHash' => '',
            'lists' => $lists,
        ];
    }

    /**
     * Makes an API call that fetches mailing lists
     * Builds ListObject objects based on the results
     * And returns them.
     *
     * @return ListObject[]
     */
    abstract protected function fetchLists(): array;

    /**
     * Fetch all custom fields for each list.
     *
     * @return FieldObject[]
     *
     * @throws IntegrationException
     */
    abstract protected function fetchFields(string $listId): array;
}
