<?php

namespace Solspace\Freeform\Form\Layout\Page\Buttons;

use Solspace\Freeform\Library\Attributes\Attributes;

class Button
{
    private string $label;
    private string $enabled;

    public function __construct(?array $config)
    {
        $this->label = $config['label'] ?? '';
        $this->enabled = $config['enabled'] ?? true;
    }

    public function render(Attributes $attributes): string
    {
        if (!$this->enabled) {
            return '';
        }

        return '<button '.$attributes.'>'.htmlspecialchars($this->label).'</button>';
    }

    public function getLabel(): string
    {
        return $this->label;
    }

    public function getEnabled(): string
    {
        return $this->enabled;
    }
}
