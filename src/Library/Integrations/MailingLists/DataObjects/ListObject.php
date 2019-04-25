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

namespace Solspace\Freeform\Library\Integrations\MailingLists\DataObjects;

use Solspace\Freeform\Library\Composer\Components\Layout;
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;
use Solspace\Freeform\Library\Integrations\MailingLists\MailingListIntegrationInterface;

class ListObject implements \JsonSerializable
{
    /** @var MailingListIntegrationInterface */
    private $mailingList;

    /** @var string */
    private $id;

    /** @var string */
    private $name;

    /** @var int */
    private $memberCount;

    /** @var FieldObject[] */
    private $fields;

    /**
     * ListObject constructor.
     *
     * @param MailingListIntegrationInterface $mailingList
     * @param string                          $id
     * @param string                          $name
     * @param FieldObject[]                   $fields
     * @param int                             $memberCount
     */
    public function __construct(
        MailingListIntegrationInterface $mailingList,
        $id,
        $name,
        array $fields = [],
        $memberCount = 0
    ) {
        $this->id          = $id;
        $this->name        = $name;
        $this->fields      = $fields;
        $this->memberCount = $memberCount;
        $this->mailingList = $mailingList;
    }

    /**
     * @return string
     */
    public function getId(): string
    {
        return $this->id;
    }

    /**
     * @return string
     */
    public function getName(): string
    {
        return $this->name;
    }

    /**
     * @return FieldObject[]
     */
    public function getFields(): array
    {
        return $this->fields;
    }

    /**
     * @return int
     */
    public function getMemberCount(): int
    {
        return $this->memberCount;
    }

    /**
     * @param array  $emails
     * @param array  $mappedValues
     *
     * @return bool
     */
    public function pushEmailsToList(array $emails, array $mappedValues): bool
    {
        return $this->mailingList->pushEmails($this, $emails, $mappedValues);
    }

    /**
     * Specify data which should be serialized to JSON
     * 
     * @return array
     */
    public function jsonSerialize(): array 
    {
        return [
            'id'          => $this->getId(),
            'name'        => $this->getName(),
            'fields'      => $this->getFields(),
            'memberCount' => $this->getMemberCount(),
        ];
    }
}
