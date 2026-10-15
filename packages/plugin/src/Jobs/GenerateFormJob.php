<?php

namespace Solspace\Freeform\Jobs;

use craft\queue\BaseJob;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Services\QueuedFormGenerationService;

class GenerateFormJob extends BaseJob
{
    public string $generationId;

    public function execute($queue): void
    {
        \Craft::$container->get(QueuedFormGenerationService::class)->execute($this->generationId);
    }

    public function getTtr(): int
    {
        return 240;
    }

    protected function defaultDescription(): ?string
    {
        return Freeform::t('Freeform: Generating form with AI');
    }
}
