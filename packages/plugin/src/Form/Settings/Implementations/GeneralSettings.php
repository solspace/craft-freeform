<?php

namespace Solspace\Freeform\Form\Settings\Implementations;

use Solspace\Freeform\Attributes\Form\SettingNamespace;
use Solspace\Freeform\Attributes\Property\Middleware;
use Solspace\Freeform\Attributes\Property\Property;
use Solspace\Freeform\Form\Settings\Implementations\Options\FormattingTemplateOptions;
use Solspace\Freeform\Form\Settings\Implementations\Options\FormTypeOptions;
use Solspace\Freeform\Form\Settings\Implementations\ValueGenerators\RandomColorGenerator;
use Solspace\Freeform\Form\Settings\SettingsNamespace;
use Solspace\Freeform\Form\Types\Regular;

#[SettingNamespace('Settings')]
class GeneralSettings extends SettingsNamespace
{
    #[Property(
        label: 'Form Name',
        instructions: 'Name or title of the form',
        placeholder: 'My Form',
    )]
    public string $name = '';

    #[Property(
        label: 'Form Handle',
        instructions: "How you'll refer to this form in the templates",
        placeholder: 'myHandle',
    )]
    #[Middleware('handle', ['name'])]
    public string $handle = '';

    #[Property(
        label: 'Form Type',
        type: Property::TYPE_SELECT,
        instructions: 'Select the type of form this is. When additional form types are installed, you can choose a different form type that enables special behaviors.',
        options: FormTypeOptions::class,
    )]
    public string $type = Regular::class;

    #[Property(
        instructions: 'What the auto-generated submission titles should look like.',
    )]
    public string $submissionTitle = '{{ dateCreated|date("Y-m-d H:i:s") }}';

    #[Property(
        type: Property::TYPE_SELECT,
        instructions: 'The formatting template to assign to this form when using Render method.',
        options: FormattingTemplateOptions::class,
    )]
    public ?string $formattingTemplate;

    #[Property(
        label: 'Form Description / Notes',
        type: Property::TYPE_TEXTAREA,
        instructions: 'Description or notes for this form.',
    )]
    public string $description = '';

    #[Property(
        label: 'Form Color',
        type: Property::TYPE_COLOR_PICKER,
        instructions: 'The color to be used for the dashboard and charts inside the control panel.',
        valueGenerator: RandomColorGenerator::class,
    )]
    public string $color = '';

    #[Property(
        label: 'Store Submitted Data',
        instructions: 'Should the submission data for this form be stored in the database?',
    )]
    public bool $storeData = true;

    // TODO: implement a way to get the options to fill on the react side
    #[Property(
        label: 'Opt-In Data Storage Checkbox',
        type: Property::TYPE_SELECT,
        instructions: 'Allow users to decide whether the submission data is saved to your site or not.',
        emptyOption: 'Disabled',
        options: [],
    )]
    public ?string $dataStorageCheckbox = null;

    #[Property(
        label: 'Enable Captchas',
        instructions: 'Disabling this option removes the Captcha check for this specific form.',
    )]
    public bool $captchas = true;
}
