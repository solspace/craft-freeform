<?php

namespace Solspace\Freeform\Events\Submissions;

use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Fields\FieldInterface;
use yii\base\Event;

class RenderTableValueEvent extends Event
{
    private ?string $output = null;

    public function __construct(
        private FieldInterface $field,
        private Submission $submission,
    ) {
        parent::__construct();
    }

    public function getField(): FieldInterface
    {
        return $this->field;
    }

    public function getSubmission(): Submission
    {
        return $this->submission;
    }

    public function getOutput(): ?string
    {
        return $this->output;
    }

    public function setOutput(null|string $output): self
    {
        $this->output = $output;

        return $this;
    }
}
