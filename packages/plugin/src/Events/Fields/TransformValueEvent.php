<?php

namespace Solspace\Freeform\Events\Fields;

use craft\events\CancelableEvent;
use Solspace\Freeform\Fields\AbstractField;

/**
 * @template T of AbstractField
 */
class TransformValueEvent extends CancelableEvent
{
    /** @var AbstractField */
    private $field;

    /** @var mixed */
    private $value;

    /**
     * @param T     $field
     * @param mixed $value
     */
    public function __construct(AbstractField $field, $value)
    {
        $this->field = $field;
        $this->value = $value;
    }

    /**
     * @return T
     */
    public function getField(): AbstractField
    {
        return $this->field;
    }

    public function getValue()
    {
        return $this->value;
    }

    public function setValue($value)
    {
        $this->value = $value;
    }
}
