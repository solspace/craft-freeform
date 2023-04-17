<?php

namespace Solspace\Freeform\Form\Settings\Implementations;

use Solspace\Freeform\Attributes\Form\SettingNamespace;
use Solspace\Freeform\Attributes\Property\Property;
use Solspace\Freeform\Attributes\Property\Section;
use Solspace\Freeform\Bundles\Form\Limiting\FormLimiting;
use Solspace\Freeform\Form\Settings\Implementations\Options\FormLimitingOptions;
use Solspace\Freeform\Form\Settings\Implementations\Options\SuccessTemplateOptions;
use Solspace\Freeform\Form\Settings\SettingsNamespace;

#[SettingNamespace('Behavior')]
class BehaviorSettings extends SettingsNamespace
{
    public const SUCCESS_BEHAVIOUR_RELOAD = 'reload';
    public const SUCCESS_BEHAVIOUR_REDIRECT_RETURN_URL = 'redirect-return-url';
    public const SUCCESS_BEHAVIOUR_LOAD_SUCCESS_TEMPLATE = 'load-success-template';

    private const SECTION_SUCCESS_AND_ERRORS = 'success-and-errors';
    private const SECTION_PROCESSING = 'processing';
    private const SECTION_LIMITS = 'limits';

    #[Section(
        self::SECTION_SUCCESS_AND_ERRORS,
        label: 'Success & Errors',
        icon: __DIR__.'/Icons/success.svg',
    )]
    #[Property(
        instructions: "Set how you'd like the success return of this form to be handled. May also be overridden at the template level.",
        type: Property::TYPE_SELECT,
        options: [
            ['value' => self::SUCCESS_BEHAVIOUR_RELOAD, 'label' => 'Reload'],
            ['value' => self::SUCCESS_BEHAVIOUR_REDIRECT_RETURN_URL, 'label' => 'Redirect'],
            ['value' => self::SUCCESS_BEHAVIOUR_LOAD_SUCCESS_TEMPLATE, 'label' => 'Load success template'],
        ],
    )]
    public string $successBehavior = self::SUCCESS_BEHAVIOUR_RELOAD;

    #[Section(self::SECTION_SUCCESS_AND_ERRORS)]
    #[Property(
        type: Property::TYPE_SELECT,
        options: SuccessTemplateOptions::class,
    )]
    public string $successTemplate = '';

    #[Section(self::SECTION_SUCCESS_AND_ERRORS)]
    #[Property(
        label: 'Return URL',
        instructions: 'The URL the form will redirect to after successful submit. This will not work when the Built-in AJAX setting is enabled unless a template-level override is set.',
    )]
    public string $returnUrl = '/';

    #[Section(self::SECTION_SUCCESS_AND_ERRORS)]
    #[Property(
        instructions: 'The text to be shown at the top of the form if the submit is successful (AJAX), or load in your template with form.successMessage.',
        type: Property::TYPE_TEXTAREA,
        placeholder: 'Form has been submitted successfully!',
    )]
    public string $successMessage = 'Form has been submitted successfully!';

    #[Section(self::SECTION_SUCCESS_AND_ERRORS)]
    #[Property(
        instructions: 'The text to be shown at the top of the form if there are any errors upon submit (AJAX), or load in your template with form.errorMessage.',
        type: Property::TYPE_TEXTAREA,
        placeholder: 'Sorry, there was an error submitting the form. Please try again.',
    )]
    public string $errorMessage = 'Sorry, there was an error submitting the form. Please try again.';

    #[Section(
        self::SECTION_PROCESSING,
        label: 'Processing',
        icon: __DIR__.'/Icons/processing.svg',
    )]
    #[Property(
        label: 'Use AJAX',
        instructions: "Use Freeform's built-in automatic AJAX submit feature",
    )]
    public bool $ajax = true;

    #[Section(self::SECTION_PROCESSING)]
    #[Property(
        label: 'Collect IP Addresses',
        instructions: "Should this form collect the user's IP address?",
    )]
    public bool $collectIpAddresses = true;

    #[Section(self::SECTION_PROCESSING)]
    #[Property(
        label: 'Show Processing Indicator on Submit',
        instructions: 'Show a loading indicator on the submit button upon submission of the form.',
    )]
    public bool $showSpinner = true;

    #[Section(self::SECTION_PROCESSING)]
    #[Property(
        label: 'Show Processing Text',
        instructions: "Enabling this will change the submit button's label to the text of your choice.",
    )]
    public bool $showLoadingText = true;

    #[Section(self::SECTION_PROCESSING)]
    #[Property(
        label: 'Processing Text',
    )]
    public string $loadingText = 'Loading...';

    #[Section(
        self::SECTION_LIMITS,
        label: 'Limits',
        icon: __DIR__.'/Icons/limitations.svg',
    )]
    #[Property(
        label: 'Limit Form Submission Rate',
        type: Property::TYPE_SELECT,
        options: FormLimitingOptions::class,
    )]
    public string $limitSubmissions = FormLimiting::NO_LIMIT;

    #[Section(self::SECTION_LIMITS)]
    #[Property(
        instructions: 'Set a date after which the form will no longer accept submissions.',
        type: Property::TYPE_DATE_PICKER,
    )]
    public ?string $stopSubmissionsAfter = null;
}
