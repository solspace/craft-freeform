<?php

namespace Solspace\Freeform\Events\Forms;

use Solspace\Freeform\Events\ArrayableEvent;
use Solspace\Freeform\Events\FormEventInterface;
use Solspace\Freeform\Form\Form;

class PrepareAjaxResponsePayloadEvent extends ArrayableEvent implements FormEventInterface
{
    public function __construct(
        private Form $form,
        private array $payload = []
    ) {
        parent::__construct([]);
    }

    public function fields(): array
    {
        return ['form', 'payload'];
    }

    public function getForm(): Form
    {
        return $this->form;
    }

    public function getPayload(): array
    {
        return $this->payload;
    }

    public function setPayload(array $value): self
    {
        $this->payload = $value;

        return $this;
    }

    public function add(string $key, $value): self
    {
        $this->payload[$key] = $value;

        return $this;
    }

    public function remove(string $key): self
    {
        if (isset($this->payload[$key])) {
            unset($this->payload[$key]);
        }

        return $this;
    }
}
