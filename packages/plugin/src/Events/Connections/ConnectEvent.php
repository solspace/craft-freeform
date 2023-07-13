<?php

namespace Solspace\Freeform\Events\Connections;

use craft\base\ElementInterface;
use Solspace\Freeform\Events\CancelableArrayableEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Integrations\Types\Elements\ElementIntegrationInterface;

class ConnectEvent extends CancelableArrayableEvent
{
    /**
     * ConnectEvent constructor.
     */
    public function __construct(
        private Form $form,
        private ElementIntegrationInterface $connection,
        private ElementInterface $element,
    ) {
        parent::__construct();
    }

    public function fields(): array
    {
        return ['form', 'connection', 'element'];
    }

    public function getForm(): Form
    {
        return $this->form;
    }

    public function getConnection(): ElementIntegrationInterface
    {
        return $this->connection;
    }

    public function getElement(): ElementInterface
    {
        return $this->element;
    }
}
