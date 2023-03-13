<?php

namespace Solspace\Freeform\Events\Forms;

use Solspace\Freeform\Events\FormEventInterface;
use Solspace\Freeform\Form\Form;
use yii\base\Event;

class FormLoadedEvent extends Event implements FormEventInterface
{
    /** @var Form */
    private $form;

    public function __construct(Form $form)
    {
        $this->form = $form;

        parent::__construct([]);
    }

    public function getForm(): Form
    {
        return $this->form;
    }
}
