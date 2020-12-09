<?php

namespace Solspace\Freeform\Events\Forms;

use Solspace\Freeform\Events\CancelableArrayableEvent;
use Solspace\Freeform\Library\Composer\Components\Form;

class BeforeSubmitEvent extends CancelableArrayableEvent
{
    /** @var Form */
    private $form;

    public function __construct(Form $form)
    {
        $this->form = $form;

        parent::__construct();
    }

    /**
     * {@inheritDoc}
     */
    public function fields(): array
    {
        return array_merge(parent::fields(), ['form']);
    }

    public function getForm(): Form
    {
        return $this->form;
    }
}
