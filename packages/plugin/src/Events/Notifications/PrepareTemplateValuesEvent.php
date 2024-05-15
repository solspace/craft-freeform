<?php

namespace Solspace\Freeform\Events\Notifications;

use yii\base\Event;

class PrepareTemplateValuesEvent extends Event
{
    public function __construct(private array $values)
    {
        parent::__construct();
    }

    public function getValues(): array
    {
        return $this->values;
    }

    public function addValue(string $key, $value): self
    {
        $this->values[$key] = $value;

        return $this;
    }

    public function addValues(array $values): self
    {
        foreach ($values as $key => $value) {
            $this->addValue($key, $value);
        }

        return $this;
    }

    public function setValues(array $values): self
    {
        $this->values = $values;

        return $this;
    }
}
