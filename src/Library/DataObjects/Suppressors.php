<?php

namespace Solspace\Freeform\Library\DataObjects;

class Suppressors
{
    /** @var bool */
    private $api = false;

    /** @var bool */
    private $connections = false;

    /** @var bool */
    private $adminNotifications = false;

    /** @var bool */
    private $dynamicRecipients = false;

    /** @var bool */
    private $submitterNotifications = false;

    /** @var bool */
    private $payments = false;

    /** @var bool */
    private $webhooks = false;

    /** @var bool */
    private $payload = false;

    /**
     * Suppressors constructor.
     *
     * @param $settings
     */
    public function __construct($settings)
    {
        if (is_bool($settings) && $settings === true) {
            $this->api                    = true;
            $this->connections            = true;
            $this->adminNotifications     = true;
            $this->dynamicRecipients      = true;
            $this->submitterNotifications = true;
            $this->payments               = true;
            $this->webhooks               = true;
            $this->payload                = true;
        }

        if (is_array($settings)) {
            foreach ($settings as $key => $value) {
                if (isset($this->$key)) {
                    $this->$key = (bool) $value;
                }
            }
        }
    }

    /**
     * @return bool
     */
    public function isApi(): bool
    {
        return $this->api;
    }

    /**
     * @return bool
     */
    public function isConnections(): bool
    {
        return $this->connections;
    }

    /**
     * @return bool
     */
    public function isAdminNotifications(): bool
    {
        return $this->adminNotifications;
    }

    /**
     * @return bool
     */
    public function isDynamicRecipients(): bool
    {
        return $this->dynamicRecipients;
    }

    /**
     * @return bool
     */
    public function isSubmitterNotifications(): bool
    {
        return $this->submitterNotifications;
    }

    /**
     * @return bool
     */
    public function isPayments(): bool
    {
        return $this->payments;
    }

    /**
     * @return bool
     */
    public function isWebhooks(): bool
    {
        return $this->webhooks;
    }

    /**
     * @return bool
     */
    public function isPayload(): bool
    {
        return $this->payload;
    }
}
