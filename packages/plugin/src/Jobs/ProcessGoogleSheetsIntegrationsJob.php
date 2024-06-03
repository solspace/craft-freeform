<?php

namespace Solspace\Freeform\Jobs;

use craft\queue\BaseJob;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Integrations\Types\Other\GoogleSheetsIntegrationInterface;

class ProcessGoogleSheetsIntegrationsJob extends BaseJob
{
    public int $formId;

    public function execute($queue): void
    {
        $freeform = Freeform::getInstance();

        $freeform->integrations->processIntegrations($freeform->forms->getFormById($this->formId), GoogleSheetsIntegrationInterface::class);
    }

    protected function defaultDescription(): ?string
    {
        return Freeform::t('Freeform :: Process Google Sheets Integrations');
    }
}
