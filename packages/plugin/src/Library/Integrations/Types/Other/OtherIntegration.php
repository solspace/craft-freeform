<?php
/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2024, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Library\Integrations\Types\Other;

use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Integrations\APIIntegration;

abstract class OtherIntegration extends APIIntegration implements OtherIntegrationInterface
{
    protected function getProcessableFields(string $category): array
    {
        return Freeform::getInstance()->integrations->getFields($this, $category);
    }
}
