<?php

namespace Solspace\Freeform\Form\Layout\Page\Buttons;

class PageButtons
{
    private string $layout;
    private ButtonAttributesCollection $attributes;

    private Button $submit;
    private Button $back;
    private Button $save;

    public function __construct(array $config)
    {
        $this->layout = $config['layout'] ?? 'save back|submit';
        $this->attributes = new ButtonAttributesCollection($config['attributes'] ?? []);

        $this->submit = new Button($config['submit'] ?? [], $this->attributes->getSubmit());
        $this->back = new Button($config['back'] ?? [], $this->attributes->getBack());
        $this->save = new Button($config['save'] ?? [], $this->attributes->getSave());
    }

    public function getLayout(): string
    {
        return $this->layout;
    }

    public function getAttributes(): ButtonAttributesCollection
    {
        return $this->attributes;
    }
}
