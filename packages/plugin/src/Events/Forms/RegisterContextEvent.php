<?php

namespace Solspace\Freeform\Events\Forms;

use Solspace\Freeform\Events\ArrayableEvent;
use Solspace\Freeform\Events\FormEventInterface;
use Solspace\Freeform\Library\Composer\Components\Form;

class RegisterContextEvent extends ArrayableEvent implements FormEventInterface
{
    /** @var Form */
    private $form;

    public function __construct(Form $form)
    {
        $this->form = $form;

        parent::__construct();
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
