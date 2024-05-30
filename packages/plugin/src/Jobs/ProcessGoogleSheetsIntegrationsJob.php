<?php

namespace Solspace\Freeform\Jobs;

use craft\queue\BaseJob;
use Solspace\Freeform\Freeform;

class ProcessGoogleSheetsIntegrationsJob extends BaseJob
{
    public int $formId;

    public function execute($queue): void
    {
        $freeform = Freeform::getInstance();

        $freeform->googleSheets->processIntegrations($freeform->forms->getFormById($this->formId));
    }

    protected function defaultDescription(): ?string
    {
        return Freeform::t('Freeform :: Process Google Sheets Integrations');
    }
}
