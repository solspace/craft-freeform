<?php

namespace Solspace\Freeform\Events\Connections;

use craft\base\ElementInterface;
use Solspace\Freeform\Events\CancelableArrayableEvent;
use Solspace\Freeform\Library\Composer\Components\Form;
use Solspace\Freeform\Library\Connections\ConnectionInterface;

class ConnectEvent extends CancelableArrayableEvent
{
    /** @var Form */
    private $form;

    /** @var ConnectionInterface */
    private $connection;

    /** @var ElementInterface */
    private $element;

    /**
     * ConnectEvent constructor.
     */
    public function __construct(Form $form, ConnectionInterface $connection, ElementInterface $element)
    {
        $this->form = $form;
        $this->connection = $connection;
        $this->element = $element;

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

    public function getConnection(): ConnectionInterface
    {
        return $this->connection;
    }

    public function getElement(): ElementInterface
    {
        return $this->element;
    }
}
