<?php

namespace Solspace\Freeform\Events\Integrations\UrlParameterTracking;

use yii\base\Event;

class PrepareParametersEvent extends Event
{
    public function __construct(
        private array $values,
        private array $trackedParameters,
    ) {
        parent::__construct();
    }

    public function getValues(): array
    {
        return $this->values;
    }

    public function setValues(array $values): self
    {
        $this->values = $values;

        return $this;
    }

    public function set(string $key, mixed $value): self
    {
        $this->values[$key] = $value;

        return $this;
    }

    public function getTrackedParameters(): array
    {
        return $this->trackedParameters;
    }
}
