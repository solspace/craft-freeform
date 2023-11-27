<?php

namespace Solspace\Freeform\Events\Submissions;

use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Fields\FieldInterface;
use yii\base\Event;

class SetSubmissionFieldValueEvent extends Event
{
    public function __construct(
        private FieldInterface $field,
        private Submission $submission,
        private mixed $value,
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

    public function getValue(): mixed
    {
        return $this->value;
    }

    public function setValue(mixed $value): self
    {
        $this->value = $value;

        return $this;
    }
}
