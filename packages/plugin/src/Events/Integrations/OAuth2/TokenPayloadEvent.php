<?php

namespace Solspace\Freeform\Events\Integrations\OAuth2;

use Solspace\Freeform\Events\ArrayableEvent;
use Solspace\Freeform\Library\Integrations\OAuth\OAuth2ConnectorInterface;

class TokenPayloadEvent extends ArrayableEvent
{
    public function __construct(
        private OAuth2ConnectorInterface $integration,
        private \stdClass $responsePayload,
    ) {
        parent::__construct();
    }

    public function getIntegration(): OAuth2ConnectorInterface
    {
        return $this->integration;
    }

    public function getResponsePayload(): \stdClass
    {
        return $this->responsePayload;
    }

    public function fields(): array
    {
        return ['integration', 'responsePayload'];
    }
}
