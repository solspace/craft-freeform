<?php

namespace Solspace\Freeform\Events\Forms;

use Solspace\Freeform\Events\FormEventInterface;
use Solspace\Freeform\Form\Form;
use yii\base\Event;

class DuplicateCheckEvent extends Event implements FormEventInterface
{
    public function __construct(private Form $form)
    {
        parent::__construct();
    }

    public function getForm(): Form
    {
        return $this->form;
    }
}
