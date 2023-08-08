<?php

namespace Solspace\Freeform\Events\Integrations;

use Solspace\Freeform\Events\ArrayableEvent;
use Solspace\Freeform\Library\Integrations\IntegrationInterface;

class GetAuthorizedClientEvent extends ArrayableEvent
{
    private array $config = [];

    public function __construct(private IntegrationInterface $integration)
    {
        parent::__construct();
    }

    public function getIntegration(): IntegrationInterface
    {
        return $this->integration;
    }

    public function getConfig(): array
    {
        return $this->config;
    }

    public function setConfig(array $config): self
    {
        $this->config = $config;

        return $this;
    }

    public function addConfig(array $config): self
    {
        $this->config = array_merge($this->config, $config);

        return $this;
    }

    public function fields(): array
    {
        return ['integration', 'config'];
    }
}
