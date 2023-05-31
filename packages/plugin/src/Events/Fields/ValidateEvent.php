<?php

namespace Solspace\Freeform\Events\Fields;

use Solspace\Freeform\Events\ArrayableEvent;
use Solspace\Freeform\Fields\FieldInterface;

class ValidateEvent extends ArrayableEvent
{
    public function __construct(private FieldInterface $field)
    {
        parent::__construct([]);
    }

    /**
     * {@inheritDoc}
     */
    public function fields(): array
    {
        return ['field'];
    }

    public function getField(): FieldInterface
    {
        return $this->field;
    }
}
