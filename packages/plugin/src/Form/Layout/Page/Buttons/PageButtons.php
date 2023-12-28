<?php

namespace Solspace\Freeform\Form\Layout\Page\Buttons;

use Solspace\Freeform\Attributes\Property\Edition;
use Solspace\Freeform\Attributes\Property\Implementations\Attributes\PageButtonAttributesTransformer;
use Solspace\Freeform\Attributes\Property\Implementations\PageButtons\ButtonTransformer;
use Solspace\Freeform\Attributes\Property\Implementations\PageButtons\SaveButtonTransformer;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Section;
use Solspace\Freeform\Attributes\Property\ValueTransformer;
use Solspace\Freeform\Form\Layout\Page\Buttons\Button\SaveButton;

class PageButtons
{
    public const ACTION_SUBMIT = 'submit';
    public const ACTION_BACK = 'back';
    public const ACTION_SAVE = 'save';

    public const INPUT_NAME_PREVIOUS_PAGE = 'form_previous_page_button';
    public const INPUT_NAME_SUBMIT = 'form_page_submit';

    #[Section(
        handle: 'general',
        label: 'General',
        icon: __DIR__.'/SectionIcons/button.svg',
    )]
    #[Input\Special\PageButtonLayout(
        label: 'Button Layout',
        layouts: [
            'save back|submit',
            'back|submit save',

            'back|save submit',
            'submit back|save',

            'save|back|submit ',
            ' back|submit|save',

            'back|submit|save ',
            ' save|back|submit',

            'submit|back|save ',
            ' submit|back|save',

            ' back|submit|save ',
            ' save|back|submit ',
        ],
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
    #[Edition(Edition::PRO)]
    #[ValueTransformer(SaveButtonTransformer::class)]
    #[Input\Special\PageButton(label: 'Save Button', togglable: true, enabled: false)]
    private SaveButton $save;

    #[Section(
        handle: 'attributes',
        label: 'Attributes',
        icon: __DIR__.'/SectionIcons/list.svg',
        order: 999,
    )]
    #[ValueTransformer(PageButtonAttributesTransformer::class)]
    #[Input\Attributes(
        tabs: [
            [
                'handle' => 'container',
                'label' => 'Container',
                'previewTag' => 'div',
            ],
            [
                'handle' => 'column',
                'label' => 'Column',
                'previewTag' => 'div',
            ],
            [
                'handle' => 'buttonWrapper',
                'label' => 'Button Wrapper',
                'previewTag' => 'div',
            ],
            [
                'handle' => 'submit',
                'label' => 'Submit',
                'previewTag' => 'button',
            ],
            [
                'handle' => 'back',
                'label' => 'Back',
                'previewTag' => 'button',
            ],
            [
                'handle' => 'save',
                'label' => 'Save',
                'previewTag' => 'button',
            ],
        ]
    )]
    private ButtonAttributesCollection $attributes;

    public function __construct(array $config)
    {
        $this->layout = $config['layout'] ?? 'save back|submit';
        $this->attributes = new ButtonAttributesCollection($config['attributes'] ?? []);

        $this->submit = new Button($config['submit'] ?? ['label' => 'Submit', 'enabled' => true]);
        $this->back = new Button($config['back'] ?? ['label' => 'Back', 'enabled' => true]);
        $this->save = new SaveButton($config['save'] ?? ['label' => 'Save', 'enabled' => false]);
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

    public function getSave(): SaveButton
    {
        return $this->save;
    }
}
