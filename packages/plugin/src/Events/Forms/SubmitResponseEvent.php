<?php

namespace Solspace\Freeform\Events\Forms;

use Solspace\Freeform\Events\ArrayableEvent;
use Solspace\Freeform\Events\FormEventInterface;
use Solspace\Freeform\Form\Form;
use yii\web\Response;

class SubmitResponseEvent extends ArrayableEvent implements FormEventInterface
{
    public function __construct(
        private Form $form,
        private Response $response
    ) {
        parent::__construct();
    }

    public function fields(): array
    {
        return ['form', 'response'];
    }

    public function getForm(): Form
    {
        return $this->form;
    }

    public function getResponse(): Response
    {
        return $this->response;
    }

    public function setResponse(Response $response): self
    {
        $this->response = $response;

        return $this;
    }
}
