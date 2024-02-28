<?php

namespace Solspace\Freeform\Events\Fields;

use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Library\Attributes\FieldAttributesCollection;
use yii\base\Event;

class CompileFieldAttributesEvent extends Event
{
    public function __construct(
        private FieldInterface $field,
        private FieldAttributesCollection $attributes,
    ) {
        parent::__construct();
    }

    public function getField(): FieldInterface
    {
        return $this->field;
    }

    public function getAttributes(): FieldAttributesCollection
    {
        return $this->attributes;
    }

    public function setAttributes(FieldAttributesCollection $attributes): self
    {
        $this->attributes = $attributes;

        return $this;
    }
}
