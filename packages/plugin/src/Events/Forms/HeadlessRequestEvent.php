<?php

namespace Solspace\Freeform\Events\Forms;

use craft\web\Request;
use Solspace\Freeform\Events\CancelableArrayableEvent;
use Solspace\Freeform\Events\FormEventInterface;
use Solspace\Freeform\Form\Form;

class HeadlessRequestEvent extends CancelableArrayableEvent implements FormEventInterface
{
    public function __construct(
        private Form $form,
        private Request $request,
        private array $values,
        private string $intent = 'submit',
    ) {
        parent::__construct();
    }

    public function fields(): array
    {
        return ['form', 'request', 'values', 'intent'];
    }

    public function getForm(): Form
    {
        return $this->form;
    }

    public function getRequest(): Request
    {
        return $this->request;
    }

    /**
     * @return array<string, mixed>
     */
    public function getValues(): array
    {
        return $this->values;
    }

    public function getIntent(): string
    {
        return $this->intent;
    }
}
