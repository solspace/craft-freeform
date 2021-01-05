<?php

namespace Solspace\Freeform\Events\Connections;

use craft\base\ElementInterface;
use Solspace\Freeform\Events\CancelableArrayableEvent;
use Solspace\Freeform\Library\Composer\Components\Form;
use Solspace\Freeform\Library\Connections\ConnectionInterface;
use Solspace\Freeform\Library\Connections\Transformers\TransformerInterface;

class ValidateEvent extends CancelableArrayableEvent
{
    /** @var Form */
    private $form;

    /** @var ConnectionInterface */
    private $connection;

    /** @var ElementInterface */
    private $element;

    /** @var TransformerInterface[] */
    private $transformers;

    /**
     * ValidateEvent constructor.
     *
     * @param TransformerInterface[] $transformers
     */
    public function __construct(Form $form, ConnectionInterface $connection, ElementInterface $element, array $transformers)
    {
        $this->form = $form;
        $this->connection = $connection;
        $this->element = $element;
        $this->transformers = $transformers;

        parent::__construct();
    }

    /**
     * {@inheritDoc}
     */
    public function fields(): array
    {
        return ['connection', 'element', 'transformers'];
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

    /**
     * @return TransformerInterface[]
     */
    public function getTransformers(): array
    {
        return $this->transformers;
    }

    /**
     * @return $this
     */
    public function addTransformer(TransformerInterface $transformer): self
    {
        $this->transformers[] = $transformer;

        return $this;
    }

    /**
     * @param TransformerInterface[] $transformers
     *
     * @return ValidateEvent
     */
    public function setTransformers(array $transformers)
    {
        $list = [];
        foreach ($transformers as $transformer) {
            if ($transformer instanceof TransformerInterface) {
                $list[] = $transformer;
            }
        }

        $this->transformers = $list;

        return $this;
    }
}
