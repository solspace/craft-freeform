<?php

namespace Solspace\Freeform\Library\DataObjects\Form\Defaults\ConfigItems;

use yii\base\Component;

abstract class BaseConfigItem extends Component implements DefaultConfigInterface
{
    public bool $locked = false;
    public mixed $value = '';
    private string $label = '';

    public function setLabel(string $label): void
    {
        $this->label = $label;
    }

    public function getLabel(): string
    {
        return $this->label;
    }

    public function isLocked(): bool
    {
        return $this->locked;
    }

    public function toArray(): array
    {
        return [
            'value' => $this->value,
            'locked' => $this->locked,
        ];
    }
}
