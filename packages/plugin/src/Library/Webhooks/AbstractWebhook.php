<?php

namespace Solspace\Freeform\Library\Webhooks;

use Solspace\Freeform\Events\Forms\SubmitEvent;

abstract class AbstractWebhook implements WebhookInterface
{
    /** @var string */
    private $webhook;

    /** @var array */
    private $settings;

    /**
     * AbstractWebhook constructor.
     */
    public function __construct(string $webhook, array $settings)
    {
        $this->webhook = $webhook;
        $this->settings = $settings;
    }

    /**
     * @throws \ReflectionException
     */
    public function getProviderName(): string
    {
        return (new \ReflectionClass($this))->getShortName();
    }

    public function getWebhook(): string
    {
        return $this->webhook;
    }

    /**
     * @param mixed $defaultValue
     *
     * @return null|mixed
     */
    public function getSetting(string $name, $defaultValue = null)
    {
        return $this->settings[$name] ?? $defaultValue;
    }

    abstract public function triggerWebhook(SubmitEvent $event): bool;
}
