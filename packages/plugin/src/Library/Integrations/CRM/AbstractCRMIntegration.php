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

namespace Solspace\Freeform\Library\Integrations\CRM;

use Solspace\Freeform\Library\Database\CRMHandlerInterface;
use Solspace\Freeform\Library\Integrations\AbstractIntegration;
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;

abstract class AbstractCRMIntegration extends AbstractIntegration implements CRMIntegrationInterface, \JsonSerializable
{
    /**
     * @return FieldObject[]
     */
    final public function getFields(): array
    {
        if ($this->isForceUpdate()) {
            $fields = $this->fetchFields();
            $this->getHandler()->updateFields($this, $fields);
        } else {
            $fields = $this->getHandler()->getFields($this);
        }

        return $fields;
    }

    /**
     * Fetch the custom fields from the integration.
     *
     * @return FieldObject[]
     */
    abstract public function fetchFields(): array;

    /**
     * Specify data which should be serialized to JSON.
     */
    public function jsonSerialize(): array
    {
        try {
            $fields = $this->getFields();
        } catch (\Exception $e) {
            $this->getLogger()->error($e->getMessage(), ['service' => $this->getServiceProvider()]);

            $fields = [];
        }

        return [
            'id' => $this->getId(),
            'name' => $this->getName(),
            'fields' => $fields,
        ];
    }

    protected function getHandler(): CRMHandlerInterface
    {
        return parent::getHandler();
    }
}
