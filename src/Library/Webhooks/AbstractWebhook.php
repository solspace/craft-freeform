<?php

namespace Solspace\Freeform\Library\Webhooks;

use Solspace\Freeform\Events\Forms\AfterSubmitEvent;

abstract class AbstractWebhook implements WebhookInterface
{
    /** @var string */
    private $webhook;

    /** @var array */
    private $settings;

    /**
     * AbstractWebhook constructor.
     *
     * @param string $webhook
     * @param array  $settings
     */
    public function __construct(string $webhook, array $settings)
    {
        $this->webhook  = $webhook;
        $this->settings = $settings;
    }

    /**
     * @return string
     * @throws \ReflectionException
     */
    public function getProviderName(): string
    {
        return (new \ReflectionClass($this))->getShortName();
    }

    /**
     * @return string
     */
    public function getWebhook(): string
    {
        return $this->webhook;
    }

    /**
     * @param string $name
     * @param mixed  $defaultValue
     *
     * @return mixed|null
     */
    public function getSetting(string $name, $defaultValue = null)
    {
        return $this->settings[$name] ?? $defaultValue;
    }

    /**
     * @param AfterSubmitEvent $event
     *
     * @return bool
     */
    abstract public function triggerWebhook(AfterSubmitEvent $event): bool;
}
