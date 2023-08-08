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

namespace Solspace\Freeform\Integrations\CRM\Pardot;

interface PardotIntegrationInterface
{
    public function getInstanceUrl(): string;

    public function setInstanceUrl(string $instanceUrl): self;

    public function getBusinessUnitId(): string;

    public function setBusinessUnitId(string $businessUnitId): self;
}
