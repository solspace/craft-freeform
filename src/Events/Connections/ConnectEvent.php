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
     *
     * @param Form                $form
     * @param ConnectionInterface $connection
     * @param ElementInterface    $element
     */
    public function __construct(Form $form, ConnectionInterface $connection, ElementInterface $element)
    {
        $this->form = $form;
        $this->connection = $connection;
        $this->element    = $element;

        parent::__construct();
    }

    /**
     * @return array
     */
    public function fields(): array
    {
        return ['form', 'connection', 'element'];
    }

    /**
     * @return Form
     */
    public function getForm(): Form
    {
        return $this->form;
    }

    /**
     * @return ConnectionInterface
     */
    public function getConnection(): ConnectionInterface
    {
        return $this->connection;
    }

    /**
     * @return ElementInterface
     */
    public function getElement(): ElementInterface
    {
        return $this->element;
    }
}
