<?php

namespace Solspace\Freeform\Bundles\Backup\DTO;

use Solspace\Freeform\Bundles\Backup\BatchProcessing\BatchProcessInterface;

class FormSubmissions
{
    public string $formUid;
    public BatchProcessInterface $submissionBatchProcessor;

    /** @var callable */
    private $processor;

    public function getProcessor(): callable
    {
        return $this->processor;
    }

    public function setProcessor(callable $processor): self
    {
        $this->processor = $processor;

        return $this;
    }
}
