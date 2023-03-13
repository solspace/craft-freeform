<?php

namespace Solspace\Freeform\Form\Settings\Implementations;

use Solspace\Freeform\Attributes\Form\SettingNamespace;
use Solspace\Freeform\Attributes\Property\Property;
use Solspace\Freeform\Bundles\Form\Limiting\FormLimiting;
use Solspace\Freeform\Form\Settings\Implementations\Options\FormLimitingOptions;
use Solspace\Freeform\Form\Settings\Implementations\Options\SuccessTemplateOptions;
use Solspace\Freeform\Form\Settings\SettingsNamespace;

#[SettingNamespace(
    label: 'Behavior',
    groups: [
        'success-and-errors' => 'Success & Errors',
        'processing' => 'Processing',
        'limits' => 'Limits',
    ],
)]
class BehaviorSettings extends SettingsNamespace
{
    public const SUCCESS_BEHAVIOUR_RELOAD = 'reload';
    public const SUCCESS_BEHAVIOUR_REDIRECT_RETURN_URL = 'redirect-return-url';
    public const SUCCESS_BEHAVIOUR_LOAD_SUCCESS_TEMPLATE = 'load-success-template';

    private const SECTION_SUCCESS_AND_ERRORS = 'success-and-errors';
    private const SECTION_PROCESSING = 'processing';
    private const SECTION_LIMITS = 'limits';

    #[Property(
        type: Property::TYPE_SELECT,
        instructions: "Set how you'd like the success return of this form to be handled. May also be overridden at the template level.",
        group: self::SECTION_SUCCESS_AND_ERRORS,
        options: [
            ['value' => self::SUCCESS_BEHAVIOUR_RELOAD, 'label' => 'Reload'],
            ['value' => self::SUCCESS_BEHAVIOUR_REDIRECT_RETURN_URL, 'label' => 'Redirect'],
            ['value' => self::SUCCESS_BEHAVIOUR_LOAD_SUCCESS_TEMPLATE, 'label' => 'Load success template'],
        ],
    )]
    public string $successBehavior = self::SUCCESS_BEHAVIOUR_RELOAD;

    #[Property(
        type: Property::TYPE_SELECT,
        group: self::SECTION_SUCCESS_AND_ERRORS,
        options: SuccessTemplateOptions::class,
    )]
    public string $successTemplate = '';

    #[Property(group: self::SECTION_SUCCESS_AND_ERRORS)]
    public string $returnUrl = '/';

    #[Property(
        type: Property::TYPE_TEXTAREA,
        instructions: 'The text to be shown at the top of the form if the submit is successful (AJAX), or load in your template with form.successMessage.',
        placeholder: 'Form has been submitted successfully!',
        group: self::SECTION_SUCCESS_AND_ERRORS,
    )]
    public string $successMessage = 'Form has been submitted successfully!';

    #[Property(
        type: Property::TYPE_TEXTAREA,
        instructions: 'The text to be shown at the top of the form if there are any errors upon submit (AJAX), or load in your template with form.errorMessage.',
        placeholder: 'Sorry, there was an error submitting the form. Please try again.',
        group: self::SECTION_SUCCESS_AND_ERRORS,
    )]
    public string $errorMessage = 'Sorry, there was an error submitting the form. Please try again.';

    #[Property(
        label: 'Use AJAX',
        instructions: "Use Freeform's built-in automatic AJAX submit feature",
        group: self::SECTION_PROCESSING,
    )]
    public bool $ajax = true;

    #[Property(
        label: 'Collect IP Addresses',
        instructions: "Should this form collect the user's IP address?",
        group: self::SECTION_PROCESSING,
    )]
    public bool $collectIpAddresses = true;

    #[Property(
        label: 'Show Processing Indicator on Submit',
        instructions: 'Show a loading indicator on the submit button upon submission of the form.',
        group: self::SECTION_PROCESSING,
    )]
    public bool $showSpinner = true;

    #[Property(
        label: 'Show Processing Text',
        instructions: "Enabling this will change the submit button's label to the text of your choice.",
        group: self::SECTION_PROCESSING,
    )]
    public bool $showLoadingText = true;

    #[Property(
        label: 'Processing Text',
        group: self::SECTION_PROCESSING,
    )]
    public string $loadingText = 'Loading...';

    #[Property(
        label: 'Limit Form Submission Rate',
        type: Property::TYPE_SELECT,
        group: self::SECTION_LIMITS,
        options: FormLimitingOptions::class,
    )]
    public string $limitSubmissions = FormLimiting::NO_LIMIT;

    #[Property(
        type: Property::TYPE_DATE_PICKER,
        instructions: 'Set a date after which the form will no longer accept submissions.',
        group: self::SECTION_LIMITS,
    )]
    public ?string $stopSubmissionsAfter = null;
}
