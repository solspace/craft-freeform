<?php

namespace Solspace\Freeform\Library\Processors;

use Solspace\Freeform\Form\Layout\Page\Buttons\PageButtons;
use Solspace\Freeform\Library\Attributes\Attributes;

class PageButtonRenderOptionProcessor extends AbstractOptionProcessor
{
    public function process(
        array $renderOptions,
        PageButtons $buttons,
        Attributes $attributes
    ): void {
        $reflection = new \ReflectionClass($buttons);

        foreach ($renderOptions as $key => $value) {
            $this->processAttributeValue($attributes, $reflection, $key, $value);
            $this->processPropertyValue($reflection, $buttons, $key, $value);
        }
    }
}
