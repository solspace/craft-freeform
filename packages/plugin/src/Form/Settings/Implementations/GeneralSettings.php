<?php

namespace Solspace\Freeform\Form\Settings\Implementations;

use Solspace\Freeform\Attributes\Form\SettingNamespace;
use Solspace\Freeform\Attributes\Property\Middleware;
use Solspace\Freeform\Attributes\Property\Property;
use Solspace\Freeform\Attributes\Property\Section;
use Solspace\Freeform\Attributes\Property\Validators;
use Solspace\Freeform\Form\Properties\GTM\GTMProperty;
use Solspace\Freeform\Form\Properties\GTM\GTMValueTransformer;
use Solspace\Freeform\Form\Settings\Implementations\Options\FormattingTemplateOptions;
use Solspace\Freeform\Form\Settings\Implementations\Options\FormTypeOptions;
use Solspace\Freeform\Form\Settings\Implementations\ValueGenerators\DefaultStatusGenerator;
use Solspace\Freeform\Form\Settings\Implementations\ValueGenerators\RandomColorGenerator;
use Solspace\Freeform\Form\Settings\SettingsNamespace;
use Solspace\Freeform\Form\Types\Regular;

#[SettingNamespace('Settings')]
class GeneralSettings extends SettingsNamespace
{
    #[Section(
        handle: 'general',
        label: 'General',
        icon: __DIR__.'/Icons/general.svg',
    )]
    #[Property(
        label: 'Form Name',
        instructions: 'Name or title of the form',
        required: true,
        placeholder: 'My Form',
    )]
    public string $name = '';

    #[Section('general')]
    #[Property(
        label: 'Form Handle',
        instructions: "How you'll refer to this form in the templates",
        required: true,
        placeholder: 'myHandle',
    )]
    #[Middleware('handle', [false])]
    #[Validators\Handle]
    #[Validators\Length(255)]
    public string $handle = '';

    #[Section('general')]
    #[Property(
        label: 'Form Type',
        instructions: 'Select the type of form this is. When additional form types are installed, you can choose a different form type that enables special behaviors.',
        type: Property::TYPE_SELECT,
        required: true,
        options: FormTypeOptions::class,
    )]
    public string $type = Regular::class;

    #[Section('general')]
    #[Property(
        instructions: 'What the auto-generated submission titles should look like.',
        required: true,
    )]
    public string $submissionTitle = '{{ dateCreated|date("Y-m-d H:i:s") }}';

    #[Section('general')]
    #[Property(
        instructions: 'The default status to be assigned to new submissions.',
        required: true,
        valueGenerator: DefaultStatusGenerator::class,
    )]
    public ?int $defaultStatus = null;

    #[Section('general')]
    #[Property(
        instructions: 'The formatting template to assign to this form when using Render method.',
        type: Property::TYPE_SELECT,
        options: FormattingTemplateOptions::class,
    )]
    public ?string $formattingTemplate;

    #[Section('general')]
    #[Property(
        label: 'Form Description / Notes',
        instructions: 'Description or notes for this form.',
        type: Property::TYPE_TEXTAREA,
    )]
    public string $description = '';

    #[Section('general')]
    #[Property(
        label: 'Form Color',
        instructions: 'The color to be used for the dashboard and charts inside the control panel.',
        type: Property::TYPE_COLOR_PICKER,
        valueGenerator: RandomColorGenerator::class,
    )]
    public string $color = '';

    #[Section(
        handle: 'data-storage',
        label: 'Data Storage',
        icon: __DIR__.'/Icons/storage.svg',
    )]
    #[Property(
        label: 'Store Submitted Data',
        instructions: 'Should the submission data for this form be stored in the database?',
    )]
    public bool $storeData = true;

    // TODO: implement a way to get the options to fill on the react side
    #[Section('data-storage')]
    #[Property(
        label: 'Opt-In Data Storage Checkbox',
        instructions: 'Allow users to decide whether the submission data is saved to your site or not.',
        type: Property::TYPE_SELECT,
        emptyOption: 'Disabled',
        options: [],
    )]
    public ?string $dataStorageCheckbox = null;

    #[Section(
        handle: 'captchas',
        label: 'Captchas',
        icon: __DIR__.'/Icons/captchas.svg',
    )]
    #[Property(
        label: 'Enable Captchas',
        instructions: 'Disabling this option removes the Captcha check for this specific form.',
    )]
    public bool $captchas = true;

    #[Section(
        handle: 'gtm',
        label: 'Google Tag Manager',
        icon: __DIR__.'/Icons/gtm.svg',
    )]
    #[Property(
        value: ['enabled' => false],
        transformer: GTMValueTransformer::class,
    )]
    public GTMProperty $gtm;
}
