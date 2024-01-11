<?php

namespace Solspace\Freeform\Form\Layout\Page\Buttons;

use Solspace\Freeform\Attributes\Property\Implementations\Attributes\PageButtonAttributesTransformer;
use Solspace\Freeform\Attributes\Property\Implementations\Field\FieldTransformer;
use Solspace\Freeform\Attributes\Property\Implementations\NotificationTemplates\NotificationTemplateTransformer;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Section;
use Solspace\Freeform\Attributes\Property\ValueTransformer;
use Solspace\Freeform\Attributes\Property\VisibilityFilter;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Interfaces\RecipientInterface;
use Solspace\Freeform\Library\DataObjects\NotificationTemplate;

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

    #[Section(
        handle: 'submit',
        label: 'Submit',
        icon: __DIR__.'/SectionIcons/submit.svg',
    )]
    #[Input\Text('Label', placeholder: 'Submit')]
    private string $submitLabel = 'Submit';

    #[Section(
        handle: 'back',
        label: 'Back',
        icon: __DIR__.'/SectionIcons/back.svg',
    )]
    #[Input\Boolean('Enable Back Button')]
    private bool $back = false;

    #[Section('back')]
    #[VisibilityFilter('Boolean(buttons.back)')]
    #[Input\Text('Label', placeholder: 'Back')]
    private string $backLabel = 'Back';

    #[Section(
        handle: 'save',
        label: 'Save',
        icon: __DIR__.'/SectionIcons/save.svg',
    )]
    #[Input\Boolean('Enable Save Button')]
    private bool $save = false;

    #[Section('save')]
    #[VisibilityFilter('Boolean(buttons.save)')]
    #[Input\Text('Label', placeholder: 'Save')]
    private string $saveLabel = 'Save';

    #[Section('save')]
    #[VisibilityFilter('Boolean(buttons.save)')]
    #[Input\Text(
        label: 'Redirect URL',
        instructions: 'Specify the redirect URL when saving a form. You can use `token` and `key` variables to pass the submission token and key to the URL.',
        placeholder: 'https://example.com',
    )]
    private string $saveRedirectUrl = '';

    #[Section('save')]
    #[VisibilityFilter('Boolean(buttons.save)')]
    #[ValueTransformer(FieldTransformer::class)]
    #[Input\Field(
        label: 'Email Notification Recipient',
        instructions: 'Select an email notification recipient.',
        emptyOption: 'Select recipient...',
        implements: [RecipientInterface::class],
    )]
    private ?FieldInterface $emailField = null;

    #[Section('save')]
    #[VisibilityFilter('Boolean(buttons.save)')]
    #[ValueTransformer(NotificationTemplateTransformer::class)]
    #[Input\NotificationTemplate(
        label: 'Email Notification Template',
        instructions: 'Select an email notification template.',
    )]
    private ?NotificationTemplate $notificationTemplate = null;

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
            $parsedLayout[] = explode('|', $group);
        }

        return $parsedLayout;
    }

    public function getAttributes(): ButtonAttributesCollection
    {
        return $this->attributes;
    }

    public function getSubmitLabel(): string
    {
        return $this->submitLabel;
    }

    public function isBack(): bool
    {
        return $this->back;
    }

    public function getBackLabel(): string
    {
        return $this->backLabel;
    }

    public function isSave(): bool
    {
        return $this->save;
    }

    public function getSaveLabel(): string
    {
        return $this->saveLabel;
    }

    public function getSaveRedirectUrl(): string
    {
        return $this->saveRedirectUrl;
    }

    public function getEmailField(): ?FieldInterface
    {
        return $this->emailField;
    }

    public function getNotificationTemplate(): ?NotificationTemplate
    {
        return $this->notificationTemplate;
    }
}
