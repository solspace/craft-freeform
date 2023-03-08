<?php

namespace Solspace\Freeform\Events\Forms;

use Solspace\Freeform\Form\Form;
use yii\base\Event;

class GetCustomPropertyEvent extends Event
{
    private $form;

    private $key;

    private $isSet;

    private $value;

    public function __construct(Form $form, string $key)
    {
        $this->form = $form;
        $this->key = $key;
        $this->isSet = false;

        parent::__construct([]);
    }

    public function getForm(): Form
    {
        return $this->form;
    }

    public function getKey(): string
    {
        return $this->key;
    }

    public function getIsSet(): bool
    {
        return $this->isSet;
    }

    public function getValue()
    {
        return $this->value;
    }

    public function setValue($value)
    {
        $this->isSet = true;

        $this->value = $value;
    }
}
