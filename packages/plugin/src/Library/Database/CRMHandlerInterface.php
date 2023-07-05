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

use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Library\Exceptions\Integrations\CRMIntegrationNotFoundException;
use Solspace\Freeform\Library\Integrations\BaseIntegration;
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;
use Solspace\Freeform\Library\Integrations\Types\CRM\CRMIntegration;

interface CRMHandlerInterface extends IntegrationHandlerInterface
{
    /**
     * @return CRMIntegration[]
     */
    public function getAllIntegrationObjects(): array;

    /**
     * @param int $id
     *
     * @return null|CRMIntegration
     *
     * @throws CRMIntegrationNotFoundException
     */
    public function getIntegrationObjectById($id);

    /**
     * Updates the fields of a given CRM integration.
     *
     * @param FieldObject[] $fields
     */
    public function updateFields(CRMIntegration $integration, array $fields): bool;

    /**
     * Returns all FieldObjects of a particular CRM integration.
     *
     * @return FieldObject[]
     */
    public function getFields(CRMIntegration $integration): array;

    /**
     * Flag the given CRM integration so that it's updated the next time it's accessed.
     */
    public function flagIntegrationForUpdating(BaseIntegration $integration);

    /**
     * Push the mapped object values to the CRM.
     */
    public function pushObject(Submission $submission): bool;
}
