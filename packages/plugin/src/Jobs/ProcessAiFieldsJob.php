<?php

namespace Solspace\Freeform\Jobs;

use craft\queue\BaseJob;
use Solspace\Freeform\Freeform;

class ProcessAiFieldsJob extends BaseJob implements AiFieldsJobInterface
{
    public ?int $formId = null;
    public ?int $submissionId = null;
    public array $postedData = [];

    public function execute($queue): void
    {
        Freeform::getInstance()
            ->ai
            ->processAiFieldsJob(
                $this->formId,
                $this->submissionId,
                $this->postedData,
            )
        ;
    }

    protected function defaultDescription(): ?string
    {
        return Freeform::t('Freeform: Processing AI Fields');
    }
}
