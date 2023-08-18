<?php

namespace Solspace\Freeform\Library\DataObjects;

class Suppressors
{
    private bool $api = false;
    private bool $connections = false;
    private bool $adminNotifications = false;
    private bool $dynamicRecipients = false;
    private bool $submitterNotifications = false;
    private bool $payments = false;
    private bool $webhooks = false;
    private bool $payload = false;

    /**
     * Suppressors constructor.
     *
     * @param mixed $settings
     */
    public function __construct(bool|array $settings = null)
    {
        if (true === $settings) {
            $this->api = true;
            $this->connections = true;
            $this->adminNotifications = true;
            $this->dynamicRecipients = true;
            $this->submitterNotifications = true;
            $this->payments = true;
            $this->webhooks = true;
            $this->payload = true;
        }

        if (\is_array($settings)) {
            foreach ($settings as $key => $value) {
                if (isset($this->{$key})) {
                    $this->{$key} = (bool) $value;
                }
            }
        }
    }

    public function isApi(): bool
    {
        return $this->api;
    }

    public function isConnections(): bool
    {
        return $this->connections;
    }

    public function isAdminNotifications(): bool
    {
        return $this->adminNotifications;
    }

    public function isDynamicRecipients(): bool
    {
        return $this->dynamicRecipients;
    }

    public function isSubmitterNotifications(): bool
    {
        return $this->submitterNotifications;
    }

    public function isPayments(): bool
    {
        return $this->payments;
    }

    public function isWebhooks(): bool
    {
        return $this->webhooks;
    }

    public function isPayload(): bool
    {
        return $this->payload;
    }
}
