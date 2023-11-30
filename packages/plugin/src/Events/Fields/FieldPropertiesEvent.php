<?php

namespace Solspace\Freeform\Events\Fields;

use Solspace\Freeform\Events\ArrayableEvent;
use Solspace\Freeform\Fields\FieldInterface;

class FieldPropertiesEvent extends ArrayableEvent
{
    public function __construct(private FieldInterface $field)
    {
        parent::__construct();
    }

    public function fields(): array
    {
        return ['field'];
    }

    public function getField(): FieldInterface
    {
        return $this->field;
    }
}
