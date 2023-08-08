<?php

namespace Solspace\Freeform\Events\Integrations\OAuth2;

use Solspace\Freeform\Events\ArrayableEvent;
use Solspace\Freeform\Library\Integrations\OAuth\OAuth2ConnectorInterface;

class InitiateAuthenticationFlowEvent extends ArrayableEvent
{
    public function __construct(
        private OAuth2ConnectorInterface $integration,
        private array $payload,
    ) {
        parent::__construct();
    }

    public function getIntegration(): OAuth2ConnectorInterface
    {
        return $this->integration;
    }

    public function getPayload(): array
    {
        return $this->payload;
    }

    public function setPayload(array $payload): self
    {
        $this->payload = $payload;

        return $this;
    }

    public function add(string $key, mixed $value): self
    {
        $this->payload[$key] = $value;

        return $this;
    }

    public function fields(): array
    {
        return ['integration', 'code', 'responsePayload'];
    }
}
