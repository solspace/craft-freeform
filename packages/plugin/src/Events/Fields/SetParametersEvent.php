<?php

namespace Solspace\Freeform\Events\Fields;

use Solspace\Freeform\Fields\FieldInterface;
use yii\base\Event;

class SetParametersEvent extends Event
{
    public function __construct(
        private FieldInterface $field,
        private array $parameters,
    ) {
        parent::__construct();
    }

    public function getField(): FieldInterface
    {
        return $this->field;
    }

    public function getParameters(): array
    {
        return $this->parameters;
    }

    public function setParameters(array $parameters): self
    {
        $this->parameters = $parameters;

        return $this;
    }
}
