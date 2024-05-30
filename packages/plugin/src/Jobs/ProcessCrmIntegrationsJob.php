<?php

namespace Solspace\Freeform\Jobs;

use craft\queue\BaseJob;
use Solspace\Freeform\Freeform;

class ProcessCrmIntegrationsJob extends BaseJob
{
    public int $formId;

    public function execute($queue): void
    {
        $freeform = Freeform::getInstance();

        $freeform->crm->processIntegrations($freeform->forms->getFormById($this->formId));
    }

    protected function defaultDescription(): ?string
    {
        return Freeform::t('Freeform :: Process CRM Integrations');
    }
}
