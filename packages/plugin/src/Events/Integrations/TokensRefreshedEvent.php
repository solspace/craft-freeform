<?php

namespace Solspace\Freeform\Events\Integrations;

use Solspace\Freeform\Events\CancelableArrayableEvent;
use Solspace\Freeform\Library\Integrations\IntegrationInterface;

class TokensRefreshedEvent extends CancelableArrayableEvent
{
    public function __construct(private IntegrationInterface $integration)
    {
        parent::__construct();
    }

    public function fields(): array
    {
        return array_merge(parent::fields(), ['integration', 'response']);
    }

    public function getIntegration(): IntegrationInterface
    {
        return $this->integration;
    }
}
