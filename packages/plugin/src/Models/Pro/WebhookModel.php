<?php

namespace Solspace\Freeform\Models\Pro;

use craft\base\Model;

class WebhookModel extends Model
{
    /** @var int */
    public $id;

    /** @var string */
    public $type;

    /** @var string */
    public $name;

    /** @var string */
    public $webhook;

    /** @var array */
    public $settings;

    /**
     * @throws \ReflectionException
     */
    public function getProviderName(): string
    {
        return (new \ReflectionClass($this->type))->getShortName();
    }

    /**
     * @return null|int
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @return null|string
     */
    public function getName()
    {
        return $this->name;
    }

    /**
     * @return null|string
     */
    public function getWebhook()
    {
        return $this->webhook;
    }

    public function getSettings(): array
    {
        return $this->settings ?? [];
    }
}
