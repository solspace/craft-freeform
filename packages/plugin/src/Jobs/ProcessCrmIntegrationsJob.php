<?php

namespace Solspace\Freeform\Jobs;

use craft\queue\BaseJob;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Integrations\Types\CRM\CRMIntegrationInterface;

class ProcessCrmIntegrationsJob extends BaseJob
{
    public int $formId;

    public function execute($queue): void
    {
        $freeform = Freeform::getInstance();

        $freeform->integrations->processIntegrations($freeform->forms->getFormById($this->formId), CRMIntegrationInterface::class);
    }

    protected function defaultDescription(): ?string
    {
        return Freeform::t('Freeform :: Process CRM Integrations');
    }
}
