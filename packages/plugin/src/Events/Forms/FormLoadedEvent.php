<?php

namespace Solspace\Freeform\Events\Forms;

use Solspace\Freeform\Library\Composer\Components\Form;
use yii\base\Event;

class FormLoadedEvent extends Event
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
