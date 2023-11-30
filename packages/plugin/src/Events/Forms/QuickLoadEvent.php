<?php

namespace Solspace\Freeform\Events\Forms;

use Solspace\Freeform\Events\CancelableArrayableEvent;
use Solspace\Freeform\Events\FormEventInterface;
use Solspace\Freeform\Form\Form;

class QuickLoadEvent extends CancelableArrayableEvent implements FormEventInterface
{
    public function __construct(private Form $form, private array $payload)
    {
        parent::__construct();
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
}
