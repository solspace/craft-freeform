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

namespace Solspace\Freeform\Library\Integrations\Types\CRM;

use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Integrations\APIIntegration;

abstract class CRMIntegration extends APIIntegration implements CRMIntegrationInterface
{
    public function getType(): string
    {
        return self::TYPE_CRM;
    }

    protected function getProcessableFields(string $category): array
    {
        return Freeform::getInstance()->crm->getFields($this, $category);
    }
}
