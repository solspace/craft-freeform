<?php

namespace Solspace\Freeform\Form\Layout\Page\Buttons;

use Solspace\Freeform\Library\Attributes\Attributes;
use Symfony\Component\Serializer\Annotation\Ignore;

class Button
{
    private string $label;

    public function __construct(?array $config, private Attributes $attributes)
    {
        $this->label = $config['label'] ?? '';
    }

    public function getLabel(): string
    {
        return $this->label;
    }

    #[Ignore]
    public function getAttributes(): Attributes
    {
        return $this->attributes;
    }
}
