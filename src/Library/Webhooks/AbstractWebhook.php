<?php

namespace Solspace\Freeform\Library\Webhooks;

use craft\base\Model;

abstract class AbstractWebhook extends Model implements WebhookInterface
{
    /** @var int */
    public $id;

    /** @var string */
    public $name;

    /** @var string */
    public $webhook;

    /** @var array */
    public $settings;

    /**
     * @return int|null
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @return string|null
     */
    public function getName()
    {
        return $this->name;
    }

    /**
     * @return string|null
     */
    public function getWebhook()
    {
        return $this->webhook;
    }

    /**
     * @return array
     */
    public function getSettings(): array
    {
        return $this->settings ?? [];
    }

    /**
     * @param string $key
     * @param mixed  $defaultValue
     *
     * @return mixed|null
     */
    public function getSetting(string $key, $defaultValue = null)
    {
        return $this->settings[$key] ?? $defaultValue;
    }
}
