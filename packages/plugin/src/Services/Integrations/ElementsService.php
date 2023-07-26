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

namespace Solspace\Freeform\Services\Integrations;

use Solspace\Freeform\Library\Integrations\IntegrationInterface;
use Solspace\Freeform\Library\Integrations\Types\Elements\ElementIntegrationInterface;

class ElementsService extends AbstractIntegrationService
{
    protected function getIntegrationType(): string
    {
        return IntegrationInterface::TYPE_ELEMENTS;
    }

    protected function getIntegrationInterface(): string
    {
        return ElementIntegrationInterface::class;
    }
}
