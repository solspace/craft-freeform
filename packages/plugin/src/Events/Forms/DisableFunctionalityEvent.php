<?php

namespace Solspace\Freeform\Events\Forms;

use Solspace\Freeform\Events\ArrayableEvent;
use Solspace\Freeform\Form\Form;

class DisableFunctionalityEvent extends ArrayableEvent
{
    public function __construct(
        private Form $form,
        private array|bool|null $settings = []
    ) {
        parent::__construct();
    }

    public function fields(): array
    {
        return ['form', 'settings'];
    }

    public function getForm(): Form
    {
        return $this->form;
    }

    public function getSettings(): array|bool|null
    {
        return $this->settings;
    }

    public function setSettings(array|bool|null $settings): self
    {
        $this->settings = $settings;

        return $this;
    }
}
