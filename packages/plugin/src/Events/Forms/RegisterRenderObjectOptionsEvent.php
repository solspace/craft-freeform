<?php

namespace Solspace\Freeform\Events\Forms;

use yii\base\Event;

class RegisterRenderObjectOptionsEvent extends Event
{
    /** @var array */
    private $options;

    public function __construct(array $options)
    {
        $this->options = $options;

        parent::__construct([]);
    }

    public function getOptions(): array
    {
        return $this->options;
    }

    public function setOptions(array $options): self
    {
        $this->options = $options;

        return $this;
    }

    public function addOption(string $key, string $value): self
    {
        $this->options[$key] = $value;

        return $this;
    }
}
