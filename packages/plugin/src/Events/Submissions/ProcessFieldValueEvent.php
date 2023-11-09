<?php

namespace Solspace\Freeform\Events\Submissions;

use craft\events\CancelableEvent;
use Solspace\Freeform\Fields\FieldInterface;

class ProcessFieldValueEvent extends CancelableEvent
{
    public function __construct(private FieldInterface $field, private mixed $value)
    {
        parent::__construct();
    }

    public function getField(): FieldInterface
    {
        return $this->field;
    }

    public function getValue(): mixed
    {
        return $this->value;
    }

    public function setValue(mixed $value): void
    {
        $this->value = $value;
    }
}
