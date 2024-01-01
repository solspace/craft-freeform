<?php

namespace Solspace\Freeform\Events\Submissions;

use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Fields\FieldInterface;
use Twig\Markup;
use yii\base\Event;

class RenderSubmissionFieldEvent extends Event
{
    private ?Markup $output = null;

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

    public function getOutput(): ?Markup
    {
        return $this->output;
    }

    public function setOutput(null|Markup|string $output): self
    {
        if (null === $output) {
            $this->output = null;
        } elseif ($output instanceof Markup) {
            $this->output = $output;
        } else {
            $this->output = new Markup($output, 'UTF-8');
        }

        return $this;
    }
}
