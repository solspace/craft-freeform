<?php

namespace Solspace\Freeform\Library\DataObjects\Form\Defaults\ConfigItems;

use yii\base\Component;

abstract class BaseConfigItem extends Component implements DefaultConfigInterface, \JsonSerializable
{
    public string $label = '';
    public bool $locked = false;
    public mixed $value = '';

    public function getLabel(): string
    {
        return $this->label;
    }

    public function isLocked(): bool
    {
        return $this->locked;
    }

    public function jsonSerialize(): \stdClass
    {
        return (object) [
            'value' => $this->value,
            'locked' => $this->locked,
        ];
    }
}
