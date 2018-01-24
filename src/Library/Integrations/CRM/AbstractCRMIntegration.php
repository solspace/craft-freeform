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

namespace Solspace\Freeform\Library\Integrations\CRM;

use Solspace\Freeform\Library\Configuration\ConfigurationInterface;
use Solspace\Freeform\Library\Database\CRMHandlerInterface;
use Solspace\Freeform\Library\Integrations\AbstractIntegration;
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;
use Solspace\Freeform\Library\Integrations\IntegrationInterface;
use Solspace\Freeform\Library\Logging\LoggerInterface;
use Solspace\Freeform\Library\Translations\TranslatorInterface;

abstract class AbstractCRMIntegration extends AbstractIntegration implements CRMIntegrationInterface, \JsonSerializable
{
    /** @var CRMHandlerInterface */
    private $crmHandler;

    /**
     * AbstractMailingList constructor.
     *
     * @param int                    $id
     * @param string                 $name
     * @param \DateTime              $lastUpdate
     * @param string                 $accessToken
     * @param array|null             $settings
     * @param LoggerInterface        $logger
     * @param ConfigurationInterface $configuration
     * @param TranslatorInterface    $translator
     * @param CRMHandlerInterface    $crmHandler
     */
    final public function __construct(
        $id,
        $name,
        \DateTime $lastUpdate,
        $accessToken,
        $settings,
        LoggerInterface $logger,
        ConfigurationInterface $configuration,
        TranslatorInterface $translator,
        CRMHandlerInterface $crmHandler
    ) {
        parent::__construct(
            $id,
            $name,
            $lastUpdate,
            $accessToken,
            $settings,
            $logger,
            $configuration,
            $translator
        );

        $this->crmHandler = $crmHandler;
    }

    /**
     * @inheritDoc
     */
    public function isOAuthConnection(): bool
    {
        return $this instanceof CRMOAuthConnector;
    }

    /**
     * @return FieldObject[]
     */
    final public function getFields(): array
    {
        if ($this->isForceUpdate()) {
            $fields = $this->fetchFields();
            $this->crmHandler->updateFields($this, $fields);
        } else {
            $fields = $this->crmHandler->getFields($this);
        }

        return $fields;
    }

    /**
     * Fetch the custom fields from the integration
     *
     * @return FieldObject[]
     */
    abstract public function fetchFields(): array;

    /**
     * Specify data which should be serialized to JSON
     *
     * @return array
     */
    public function jsonSerialize(): array
    {
        try {
            $fields = $this->getFields();
        } catch (\Exception $e) {
            $this->getLogger()->log(LoggerInterface::LEVEL_ERROR, $e->getMessage(), 'CRM Integrations');

            $fields = [];
        }

        return [
            'id'     => $this->getId(),
            'name'   => $this->getName(),
            'fields' => $fields,
        ];
    }
}
