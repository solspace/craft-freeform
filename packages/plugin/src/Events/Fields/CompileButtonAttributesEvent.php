<?php

namespace Solspace\Freeform\Events\Fields;

use Solspace\Freeform\Form\Layout\Page\Buttons\ButtonAttributesCollection;
use Solspace\Freeform\Form\Layout\Page\Buttons\PageButtons;
use yii\base\Event;

class CompileButtonAttributesEvent extends Event
{
    public function __construct(
        private PageButtons $buttons,
        private ButtonAttributesCollection $attributes,
    ) {
        parent::__construct();
    }

    public function getButtons(): PageButtons
    {
        return $this->buttons;
    }

    public function getAttributes(): ButtonAttributesCollection
    {
        return $this->attributes;
    }

    public function setAttributes(ButtonAttributesCollection $attributes): self
    {
        $this->attributes = $attributes;

        return $this;
    }
}
