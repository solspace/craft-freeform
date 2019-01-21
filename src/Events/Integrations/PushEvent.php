<?php

namespace Solspace\Freeform\Events\Integrations;

use Solspace\Freeform\Events\CancelableArrayableEvent;
use Solspace\Freeform\Library\Integrations\AbstractIntegration;

class PushEvent extends CancelableArrayableEvent
{
    /** @var AbstractIntegration */
    private $integration;

    /** @var array */
    private $values;

    /**
     * @param AbstractIntegration $integration
     * @param array               $values
     */
    public function __construct(AbstractIntegration $integration, array $values)
    {
        $this->integration = $integration;
        $this->values      = $values;

        parent::__construct();
    }

    /**
     * @inheritDoc
     */
    public function fields(): array
    {
        return array_merge(parent::fields(), ['integration', 'values']);
    }

    /**
     * @return AbstractIntegration
     */
    public function getIntegration(): AbstractIntegration
    {
        return $this->integration;
    }

    /**
     * @return array
     */
    public function getValues(): array
    {
        return $this->values;
    }

    /**
     * @param array $values
     *
     * @return PushEvent
     */
    public function setValues(array $values = []): PushEvent
    {
        $this->values = $values;

        return $this;
    }

    /**
     * @param string $key
     * @param mixed  $value
     *
     * @return PushEvent
     */
    public function addValue(string $key, $value): PushEvent
    {
        $this->values[$key] = $value;

        return $this;
    }
}
