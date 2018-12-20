<?php

namespace Solspace\Freeform\Events\Integrations;

use craft\events\CancelableEvent;
use Solspace\Freeform\Library\Integrations\AbstractIntegration;

class PushEvent extends CancelableEvent
{
    /** @var AbstractIntegration */
    public $integration;

    /** @var array */
    public $values;

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
}
