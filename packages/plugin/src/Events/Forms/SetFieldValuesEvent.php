<?php

namespace Solspace\Freeform\Events\Forms;

use Solspace\Freeform\Events\FormEventInterface;
use Solspace\Freeform\Form\Form;
use yii\base\Event;

class SetFieldValuesEvent extends Event implements FormEventInterface
{
    public function __construct(
        private Form $form,
        private array $values
    ) {
        parent::__construct();
    }

    public function getForm(): Form
    {
        return $this->form;
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

    public function setValue(string $key, mixed $value): self
    {
        $this->values[$key] = $value;

        return $this;
    }
}
