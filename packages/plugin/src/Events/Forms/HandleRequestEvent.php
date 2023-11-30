<?php

namespace Solspace\Freeform\Events\Forms;

use Solspace\Freeform\Events\CancelableArrayableEvent;
use Solspace\Freeform\Events\FormEventInterface;
use Solspace\Freeform\Form\Form;
use yii\web\Request;

class HandleRequestEvent extends CancelableArrayableEvent implements FormEventInterface
{
    public function __construct(private Form $form, private Request $request)
    {
        parent::__construct();
    }

    public function fields(): array
    {
        return ['form', 'request'];
    }

    public function getForm(): Form
    {
        return $this->form;
    }

    public function getRequest(): Request
    {
        return $this->request;
    }
}
