<?php

namespace Solspace\Freeform\Form\Settings\Implementations;

use Solspace\Freeform\Attributes\Form\SettingNamespace;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Middleware;
use Solspace\Freeform\Attributes\Property\Section;
use Solspace\Freeform\Attributes\Property\Validators;
use Solspace\Freeform\Attributes\Property\ValueGenerator;
use Solspace\Freeform\Attributes\Property\ValueTransformer;
use Solspace\Freeform\Attributes\Property\VisibilityFilter;
use Solspace\Freeform\Form\Properties\GTM\GTMProperty;
use Solspace\Freeform\Form\Properties\GTM\GTMValueTransformer;
use Solspace\Freeform\Form\Settings\Implementations\Options\FormattingTemplateOptions;
use Solspace\Freeform\Form\Settings\Implementations\Options\FormStatusOptions;
use Solspace\Freeform\Form\Settings\Implementations\Options\FormTypeOptions;
use Solspace\Freeform\Form\Settings\Implementations\ValueGenerators\DefaultStatusGenerator;
use Solspace\Freeform\Form\Settings\Implementations\ValueGenerators\DefaultTemplateGenerator;
use Solspace\Freeform\Form\Settings\Implementations\ValueGenerators\RandomColorGenerator;
use Solspace\Freeform\Form\Settings\SettingsNamespace;
use Solspace\Freeform\Form\Types\Regular;

#[SettingNamespace(
    'General',
    order: 1,
)]
class GeneralSettings extends SettingsNamespace
{
    private const SECTION_GENERAL = 'general';
    private const SECTION_DATA_STORAGE = 'data-storage';
    // TODO: Refactor as Integrations
    private const SECTION_CAPTCHAS = 'captchas';
    private const SECTION_GTM = 'gtm';

    #[Section(
        self::SECTION_GENERAL,
        label: 'General',
        icon: __DIR__.'/Icons/'.self::SECTION_GENERAL.'.svg',
        order: 1,
    )]
    #[Input\Text(
        label: 'Form Name',
        instructions: 'Enter a name for this form.',
        order: 1,
        placeholder: 'My Form',
    )]
    #[Middleware('injectInto', [
        'target' => 'handle',
        'camelize' => true,
    ])]
    #[Validators\Required]
    public string $name = '';

    #[Section(self::SECTION_GENERAL)]
    #[Input\Text(
        label: 'Form Handle',
        instructions: 'Enter a name for this form that will be referred to in your templates.',
        order: 2,
        placeholder: 'myHandle',
    )]
    #[Middleware('handle')]
    #[Validators\Required]
    #[Validators\Handle]
    #[Validators\Length(255)]
    public string $handle = '';

    #[Section(self::SECTION_GENERAL)]
    #[Validators\Required]
    #[Input\Select(
        label: 'Form Type',
        instructions: 'Select the type of form this is.',
        order: 3,
        options: FormTypeOptions::class,
    )]
    public string $type = Regular::class;

    #[Section(self::SECTION_GENERAL)]
    #[Validators\Required]
    #[Input\Text(
        instructions: 'How the titles of submissions should be auto-generated for this form.',
        order: 4,
    )]
    public string $submissionTitle = 'Submission on {{ dateCreated|date("Y-m-d H:i:s") }}';

    #[Section(self::SECTION_GENERAL)]
    #[ValueGenerator(DefaultTemplateGenerator::class)]
    #[Validators\Required]
    #[Input\Select(
        label: 'Formatting Template',
        instructions: 'Select a formatting template to be used when rendering this form.',
        order: 5,
        options: FormattingTemplateOptions::class,
    )]
    public ?string $formattingTemplate;

    #[Section(self::SECTION_GENERAL)]
    #[Input\Textarea(
        label: 'Form Description',
        instructions: 'Enter a description or notes for this form.',
        order: 6,
    )]
    public string $description = '';

    #[Section(self::SECTION_GENERAL)]
    #[ValueGenerator(RandomColorGenerator::class)]
    #[Input\ColorPicker(
        label: 'Form Color',
        instructions: 'Choose a color for this form (generally used in the control panel).',
        order: 7,
    )]
    public string $color = '';

    #[Section(
        self::SECTION_DATA_STORAGE,
        label: 'Data Storage',
        icon: __DIR__.'/Icons/'.self::SECTION_DATA_STORAGE.'.svg',
        order: 2,
    )]
    #[Input\Boolean(
        label: 'Store Submitted Data for this Form',
        instructions: 'All submissions users make on this form will be stored in the database.',
        order: 1,
    )]
    public bool $storeData = true;

    #[Section(self::SECTION_DATA_STORAGE)]
    #[ValueGenerator(DefaultStatusGenerator::class)]
    #[Validators\Required]
    #[Input\Select(
        instructions: 'Select the default status for each submission of this form.',
        order: 2,
        options: FormStatusOptions::class,
    )]
    public ?int $defaultStatus = null;

    #[Section(self::SECTION_DATA_STORAGE)]
    #[Input\Boolean(
        label: 'Collect IP Addresses',
        instructions: 'Collect and store each users IP address when submitting the form.',
        order: 3,
    )]
    public bool $collectIpAddresses = true;

    #[Section(self::SECTION_DATA_STORAGE)]
    #[Input\Boolean(
        label: 'Allow Users to Opt-in',
        instructions: 'Allow users to choose whether they want their submission data stored in the database.',
        order: 4,
    )]
    public bool $allowUsersToOptIn = false;

    // TODO: implement a way to get the options to fill on the react side
    #[Section(self::SECTION_DATA_STORAGE)]
    #[VisibilityFilter('Boolean(allowUsersToOptIn)')]
    #[Input\Select(
        label: 'Opt-in Checkbox',
        instructions: 'Select the checkbox field that will act as the opt-in for the user submitting the form.',
        order: 5,
        emptyOption: 'Please select...',
        options: [],
    )]
    public ?string $optInCheckbox = null;

    #[Section(
        self::SECTION_GTM,
        label: 'Google Tag Manager',
        icon: __DIR__.'/Icons/'.self::SECTION_GTM.'.svg',
        order: 4,
    )]
    #[ValueTransformer(GTMValueTransformer::class)]
    #[Input\Special\GTM(
        order: 1,
    )]
    public GTMProperty $gtm;
}
