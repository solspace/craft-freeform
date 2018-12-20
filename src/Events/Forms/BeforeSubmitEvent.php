<?php

namespace Solspace\Freeform\Events\Forms;

use craft\events\CancelableEvent;
use Solspace\Freeform\Library\Composer\Components\Form;

class BeforeSubmitEvent extends CancelableEvent
{
    /** @var Form */
    public $form;

    /**
     * @param Form $form
     */
    public function __construct(Form $form)
    {
        $this->form = $form;

        parent::__construct();
    }

    /**
     * @return Form
     */
    public function getForm(): Form
    {
        return $this->form;
    }
}
