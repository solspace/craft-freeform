<?php

namespace Solspace\Freeform\Events\Integrations;

use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Form\Form;
use yii\base\Event;

class ProcessPostedValuesEvent extends Event
{
    public function __construct(
        private Form $form,
        private Submission $submission,
        private array $values,
    ) {
        parent::__construct();
    }

    public function getForm(): Form
    {
        return $this->form;
    }

    public function getSubmission(): Submission
    {
        return $this->submission;
    }

    public function getValues(): array
    {
        return $this->values;
    }

    public function setValues(array $values): self
    {
        $this->values = $values;

        return $this;
    }

    public function set(string $key, mixed $value): self
    {
        $this->values[$key] = $value;

        return $this;
    }
}
