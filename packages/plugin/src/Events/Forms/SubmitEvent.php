<?php

namespace Solspace\Freeform\Events\Forms;

use Solspace\Freeform\Events\CancelableArrayableEvent;
use Solspace\Freeform\Library\Composer\Components\Form;

class SubmitEvent extends CancelableArrayableEvent
{
    /** @var Form */
    private $form;

    public function __construct(Form $form)
    {
        $this->form = $form;
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
}
