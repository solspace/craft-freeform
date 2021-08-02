<?php

namespace Solspace\Freeform\Events\Fields;

use Solspace\Freeform\Library\Composer\Components\AbstractField;
use yii\base\Event;

/**
 * @template T of AbstractField
 */
class TransformValueEvent extends Event
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
