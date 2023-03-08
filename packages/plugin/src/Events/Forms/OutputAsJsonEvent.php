<?php

namespace Solspace\Freeform\Events\Forms;

use Solspace\Freeform\Events\ArrayableEvent;
use Solspace\Freeform\Form\Form;

class OutputAsJsonEvent extends ArrayableEvent
{
    /** @var Form */
    private $form;

    private $jsonObject;

    public function __construct(Form $form, array $jsonObject = [])
    {
        $this->form = $form;
        $this->jsonObject = $jsonObject;

        parent::__construct([]);
    }

    public function fields()
    {
        return ['form', 'json'];
    }

    public function getForm(): Form
    {
        return $this->form;
    }

    public function getJsonObject(): array
    {
        return $this->jsonObject;
    }

    public function add(string $key, $value): self
    {
        $this->jsonObject[$key] = $value;

        return $this;
    }

    public function setJsonObject(array $jsonObject)
    {
        $this->jsonObject = $jsonObject;
    }
}
