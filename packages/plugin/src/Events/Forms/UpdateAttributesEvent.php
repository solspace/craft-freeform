<?php

namespace Solspace\Freeform\Events\Forms;

use Solspace\Freeform\Events\ArrayableEvent;
use Solspace\Freeform\Library\Composer\Components\Form;

class UpdateAttributesEvent extends ArrayableEvent
{
    /** @var Form */
    private $form;

    /** @var array */
    private $attributes;

    public function __construct(Form $form, array $attributes = [])
    {
        $this->form = $form;
        $this->attributes = $attributes;

        parent::__construct([]);
    }

    public function fields(): array
    {
        return ['form'];
    }

    public function getForm(): Form
    {
        return $this->form;
    }

    public function getAttributes(): array
    {
        return $this->attributes;
    }
}
