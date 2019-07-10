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
     * @return string
     * @throws \ReflectionException
     */
    public function getProviderName(): string
    {
        return (new \ReflectionClass($this->type))->getShortName();
    }

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
}
