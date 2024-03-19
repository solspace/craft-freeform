<?php

namespace Solspace\Freeform\Library\DataObjects;

/**
 * @property bool $api
 * @property bool $elements
 * @property bool $adminNotifications
 * @property bool $userSelectNotifications
 * @property bool $emailFieldNotifications
 * @property bool $conditionalNotifications
 * @property bool $payments
 * @property bool $webhooks
 * @property bool $payload
 * @property bool $captchas
 * @property bool $honeypot
 * @property bool $javascriptTest
 * @property bool $submitButtons
 */
class DisabledFunctionality
{
    private bool $api = false;
    private bool $elements = false;

    private bool $adminNotifications = false;
    private bool $userSelectNotifications = false;
    private bool $emailFieldNotifications = false;
    private bool $conditionalNotifications = false;

    private bool $payments = false;
    private bool $webhooks = false;

    private bool $payload = false;
    private bool $captchas = false;
    private bool $honeypot = false;
    private bool $javascriptTest = false;

    private bool $submitButtons = false;

    /**
     * Suppressors constructor.
     *
     * @param mixed $settings
     */
    public function __construct(null|array|bool $settings = null)
    {
        if (true === $settings) {
            $this->api = true;
            $this->elements = true;

            $this->adminNotifications = true;
            $this->userSelectNotifications = true;
            $this->emailFieldNotifications = true;
            $this->conditionalNotifications = true;

            $this->payments = true;
            $this->webhooks = true;

            $this->payload = true;
            $this->captchas = true;
            $this->honeypot = true;
            $this->javascriptTest = true;
        }

        if (\is_array($settings)) {
            foreach ($settings as $key => $value) {
                if ('notifications' === $key) {
                    $this->adminNotifications = $value;
                    $this->userSelectNotifications = $value;
                    $this->emailFieldNotifications = $value;
                    $this->conditionalNotifications = $value;
                }

                if ('notifications' === $value) {
                    $this->adminNotifications = true;
                    $this->userSelectNotifications = true;
                    $this->emailFieldNotifications = true;
                    $this->conditionalNotifications = true;
                }

                if (\is_string($value) && isset($this->{$value})) {
                    $this->{$value} = true;
                }

                if (isset($this->{$key})) {
                    $this->{$key} = (bool) $value;
                }
            }
        }
    }

    public function __isset(string $name): bool
    {
        return property_exists($this, $name);
    }

    public function __get(string $name)
    {
        return $this->{$name};
    }

    public function isApi(): bool
    {
        return $this->api;
    }

    public function isElements(): bool
    {
        return $this->elements;
    }

    public function isAdminNotifications(): bool
    {
        return $this->adminNotifications;
    }

    public function isUserSelectNotifications(): bool
    {
        return $this->userSelectNotifications;
    }

    public function isEmailFieldNotifications(): bool
    {
        return $this->emailFieldNotifications;
    }

    public function isConditionalNotifications(): bool
    {
        return $this->conditionalNotifications;
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

    public function isCaptchas(): bool
    {
        return $this->captchas;
    }

    public function isHoneypot(): bool
    {
        return $this->honeypot;
    }

    public function isJavascriptTest(): bool
    {
        return $this->javascriptTest;
    }

    public function isSubmitButtons(): bool
    {
        return $this->submitButtons;
    }
}
