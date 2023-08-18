<?php

namespace Solspace\Freeform\Events\Integrations;

use Solspace\Freeform\Events\CancelableArrayableEvent;
use Solspace\Freeform\Library\Integrations\BaseIntegration;

class PushEvent extends CancelableArrayableEvent
{
    /** @var BaseIntegration */
    private $integration;

    /** @var array */
    private $values;

    public function __construct(BaseIntegration $integration, array $values)
    {
        $this->integration = $integration;
        $this->values = $values;

        parent::__construct();
    }

    public function fields(): array
    {
        return array_merge(parent::fields(), ['integration', 'values']);
    }

    public function getIntegration(): BaseIntegration
    {
        return $this->integration;
    }

    public function getValues(): array
    {
        return $this->values;
    }

    public function setValues(array $values = []): self
    {
        $this->values = $values;

        return $this;
    }

    /**
     * @param mixed $value
     */
    public function addValue(string $key, $value): self
    {
        $this->values[$key] = $value;

        return $this;
    }
}
