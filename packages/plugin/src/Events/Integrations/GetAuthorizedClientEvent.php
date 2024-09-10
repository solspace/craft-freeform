<?php

namespace Solspace\Freeform\Events\Integrations;

use craft\helpers\ArrayHelper;
use GuzzleHttp\HandlerStack;
use Solspace\Freeform\Events\ArrayableEvent;
use Solspace\Freeform\Library\Integrations\IntegrationInterface;

class GetAuthorizedClientEvent extends ArrayableEvent
{
    private array $config = [];
    private ?HandlerStack $stack = null;

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
        $this->config = ArrayHelper::merge($this->config, $config);

        return $this;
    }

    public function getStack(): ?HandlerStack
    {
        return $this->stack;
    }

    public function pushToStack(callable $middleware, string $name = ''): self
    {
        if (null === $this->stack) {
            $this->stack = HandlerStack::create();
        }

        $this->stack->push($middleware, $name);

        return $this;
    }

    public function fields(): array
    {
        return ['integration', 'config'];
    }
}
