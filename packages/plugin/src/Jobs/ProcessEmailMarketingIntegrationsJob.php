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

namespace Solspace\Freeform\Jobs;

use craft\queue\BaseJob;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Integrations\Types\EmailMarketing\EmailMarketingIntegrationInterface;

class ProcessEmailMarketingIntegrationsJob extends BaseJob implements IntegrationJobInterface
{
    public ?int $formId = null;

    public ?int $submissionId = null;

    public function execute($queue): void
    {
        Freeform::getInstance()->integrations->processIntegrations($this->formId, $this->submissionId, EmailMarketingIntegrationInterface::class);
    }

    protected function defaultDescription(): ?string
    {
        return Freeform::t('Freeform: Processing Email Marketing Integrations');
    }
}
