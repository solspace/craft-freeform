<?php

namespace Solspace\Freeform\Events\Forms;

use Solspace\Freeform\Events\ArrayableEvent;
use Solspace\Freeform\Library\Composer\Components\Form;
use yii\web\Request;

class HandleRequestEvent extends ArrayableEvent
{
    /** @var Form */
    private $form;

    /** @var Request */
    private $request;

    public function __construct(Form $form, Request $request)
    {
        $this->form = $form;
        $this->request = $request;

        parent::__construct();
    }

    /**
     * {@inheritDoc}
     */
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
