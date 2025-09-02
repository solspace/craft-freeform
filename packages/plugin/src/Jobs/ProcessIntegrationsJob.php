<?php

namespace Solspace\Freeform\Jobs;

use craft\queue\BaseJob;
use Solspace\Freeform\Freeform;

class ProcessIntegrationsJob extends BaseJob implements IntegrationJobInterface
{
    public ?int $formId = null;
    public ?int $submissionId = null;
    public array $postedData = [];
    public ?string $type = null;

    public function execute($queue): void
    {
        Freeform::getInstance()
            ->integrations
            ->processIntegrationJob(
                $this->formId,
                $this->submissionId,
                $this->postedData,
                $this->type,
            )
        ;
    }

    protected function defaultDescription(): ?string
    {
        return Freeform::t('Freeform: Processing Integrations');
    }
}
