<?php

namespace Solspace\Freeform\Events\Forms;

use craft\web\Request;
use Solspace\Freeform\Events\CancelableArrayableEvent;
use Solspace\Freeform\Events\FormEventInterface;
use Solspace\Freeform\Library\Composer\Components\Form;

class GraphQLRequestEvent extends CancelableArrayableEvent implements FormEventInterface
{
    private Form $form;

    private Request $request;

    private array $arguments;

    public function __construct(Form $form, Request $request, array $arguments)
    {
        $this->form = $form;
        $this->request = $request;
        $this->arguments = $arguments;

        parent::__construct();
    }

    public function fields(): array
    {
        return ['form', 'request', 'arguments'];
    }

    public function getForm(): Form
    {
        return $this->form;
    }

    public function getRequest(): Request
    {
        return $this->request;
    }

    public function getArguments(): array
    {
        return $this->arguments;
    }
}
