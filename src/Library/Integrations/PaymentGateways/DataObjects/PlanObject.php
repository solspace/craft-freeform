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

namespace Solspace\Freeform\Library\Integrations\PaymentGateways\DataObjects;

use Solspace\Freeform\Library\Composer\Components\Layout;
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;
use Solspace\Freeform\Library\Integrations\MailingLists\MailingListIntegrationInterface;
use Solspace\Freeform\Library\Integrations\PaymentGateways\PaymentGatewayIntegrationInterface;

class PlanObject implements \JsonSerializable
{
    /** @var string */
    private $id;

    /** @var string */
    private $name;

    /**
     * ListObject constructor.
     *
     * @param string $id
     * @param string $name
     * @param string $resourceId
     */
    public function __construct(
        $id,
        $name
    ) {
        $this->id         = $id;
        $this->name       = $name;
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
     * Specify data which should be serialized to JSON
     *
     * @return array
     */
    public function jsonSerialize(): array
    {
        return [
            'id'         => $this->getId(),
            'name'       => $this->getName(),
        ];
    }
}
