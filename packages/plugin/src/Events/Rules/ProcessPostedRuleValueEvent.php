<?php

namespace Solspace\Freeform\Events\Rules;

use Solspace\Freeform\Fields\FieldInterface;
use yii\base\Event;

class ProcessPostedRuleValueEvent extends Event
{
    private mixed $value;

    public function __construct(private FieldInterface $field)
    {
        $this->value = $field->getValue();

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

    public function setValue(mixed $value): self
    {
        $this->value = $value;

        return $this;
    }
}
