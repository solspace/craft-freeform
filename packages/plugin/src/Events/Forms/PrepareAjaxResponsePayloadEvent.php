<?php

namespace Solspace\Freeform\Events\Forms;

use Solspace\Freeform\Events\ArrayableEvent;
use Solspace\Freeform\Library\Composer\Components\Form;

class PrepareAjaxResponsePayloadEvent extends ArrayableEvent
{
    /** @var Form */
    private $form;

    /** @var array */
    private $payload;

    public function __construct(Form $form, array $payload = [])
    {
        $this->form = $form;
        $this->payload = $payload;

        parent::__construct([]);
    }

    public function fields()
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
