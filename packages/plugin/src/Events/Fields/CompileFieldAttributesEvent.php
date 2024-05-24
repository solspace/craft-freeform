<?php

namespace Solspace\Freeform\Events\Fields;

use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Library\Attributes\Attributes;
use yii\base\Event;

/**
 * @template T of Attributes
 */
class CompileFieldAttributesEvent extends Event
{
    /**
     * @param T               $attributes
     * @param class-string<T> $class
     */
    public function __construct(
        private FieldInterface $field,
        private Attributes $attributes,
        private string $class,
    ) {
        parent::__construct();
    }

    public function getField(): FieldInterface
    {
        return $this->field;
    }

    /**
     * @return T
     */
    public function getAttributes(): Attributes
    {
        return $this->attributes;
    }

    /**
     * @param T $attributes
     */
    public function setAttributes(Attributes $attributes): self
    {
        $this->attributes = $attributes;

        return $this;
    }

    /**
     * @return class-string<T>
     */
    public function getClass(): string
    {
        return $this->class;
    }
}
