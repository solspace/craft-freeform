<?php

namespace Solspace\Freeform\Form\Layout\Page\Buttons;

use Solspace\Freeform\Attributes\Property\Implementations\Attributes\AttributesTransformer;
use Solspace\Freeform\Attributes\Property\Implementations\PageButtons\ButtonTransformer;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Section;
use Solspace\Freeform\Attributes\Property\ValueTransformer;

class PageButtons
{
    public const PREVIOUS_PAGE_INPUT_NAME = 'form_previous_page_button';
    public const SUBMIT_INPUT_NAME = 'form_page_submit';

    #[Section(
        handle: 'general',
        label: 'General',
        icon: __DIR__.'/SectionIcons/button.svg',
    )]
    #[Input\Special\PageButtonLayout(
        label: 'Button Layout',
        elements: [
            ['value' => 'submit', 'label' => 'Submit'],
            ['value' => 'back', 'label' => 'Back'],
            ['value' => 'save', 'label' => 'Save'],
            ['value' => ' ', 'label' => 'Space'],
        ]
    )]
    private string $layout;

    #[Section('general')]
    #[ValueTransformer(ButtonTransformer::class)]
    #[Input\Special\PageButton('Submit Button')]
    private Button $submit;

    #[Section('general')]
    #[ValueTransformer(ButtonTransformer::class)]
    #[Input\Special\PageButton(label: 'Back Button', togglable: true)]
    private Button $back;

    #[Section('general')]
    #[ValueTransformer(ButtonTransformer::class)]
    #[Input\Special\PageButton(label: 'Save Button', togglable: true, enabled: false)]
    private Button $save;

    #[Section(
        handle: 'attributes',
        label: 'Attributes',
        icon: __DIR__.'/SectionIcons/list.svg',
        order: 999,
    )]
    #[ValueTransformer(AttributesTransformer::class)]
    #[Input\Attributes]
    private ButtonAttributesCollection $attributes;

    public function __construct(array $config)
    {
        $this->layout = $config['layout'] ?? 'save back|submit';
        $this->attributes = new ButtonAttributesCollection($config['attributes'] ?? []);

        $this->submit = new Button($config['submit'] ?? ['label' => 'Submit', 'enabled' => true]);
        $this->back = new Button($config['back'] ?? ['label' => 'Back', 'enabled' => true]);
        $this->save = new Button($config['save'] ?? ['label' => 'Save', 'enabled' => false]);
    }

    public function getLayout(): string
    {
        return $this->layout;
    }

    /**
     * @return array<array<Button>>
     */
    public function getParsedLayout(): array
    {
        $layout = $this->layout;
        $layout = preg_replace('/\s+/', ' ', $layout);
        $groups = explode(' ', $layout);

        $parsedLayout = [];
        foreach ($groups as $group) {
            $buttonKeys = explode('|', $group);

            $buttons = [];
            foreach ($buttonKeys as $key) {
                if (isset($this->{$key})) {
                    $buttons[$key] = $this->{$key};
                }
            }
            $parsedLayout[] = $buttons;
        }

        return $parsedLayout;
    }

    public function getAttributes(): ButtonAttributesCollection
    {
        return $this->attributes;
    }

    public function getSubmit(): Button
    {
        return $this->submit;
    }

    public function getBack(): Button
    {
        return $this->back;
    }

    public function getSave(): Button
    {
        return $this->save;
    }
}
