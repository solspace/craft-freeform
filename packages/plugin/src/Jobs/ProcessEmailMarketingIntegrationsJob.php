<?php

namespace Solspace\Freeform\Jobs;

use craft\queue\BaseJob;
use Solspace\Freeform\Freeform;

class ProcessEmailMarketingIntegrationsJob extends BaseJob
{
    public int $formId;

    public function execute($queue): void
    {
        $freeform = Freeform::getInstance();

        $freeform->emailMarketing->processIntegrations($freeform->forms->getFormById($this->formId));
    }

    protected function defaultDescription(): ?string
    {
        return Freeform::t('Freeform :: Process Email Marketing Integrations');
    }
}
