<?php

namespace Solspace\Freeform\Library\Processors;

use Solspace\Freeform\Form\Layout\Page\Buttons\PageButtons;

class PageButtonRenderOptionProcessor extends AbstractOptionProcessor
{
    public function process(array $renderOptions, PageButtons $buttons): void
    {
        $reflection = new \ReflectionClass($buttons);

        foreach ($renderOptions as $key => $value) {
            $this->processPropertyValue($reflection, $buttons, $key, $value);
        }
    }
}
