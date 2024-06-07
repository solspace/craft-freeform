<?php

namespace Solspace\Freeform\Jobs;

use craft\queue\BaseJob;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Integrations\Types\EmailMarketing\EmailMarketingIntegrationInterface;

class ProcessEmailMarketingIntegrationsJob extends BaseJob
{
    public int $formId;

    public function execute($queue): void
    {
        $freeform = Freeform::getInstance();

        $freeform->integrations->processIntegrations($freeform->forms->getFormById($this->formId), EmailMarketingIntegrationInterface::class);
    }

    protected function defaultDescription(): ?string
    {
        return Freeform::t('Freeform: Processing Email Marketing Integrations');
    }
}
