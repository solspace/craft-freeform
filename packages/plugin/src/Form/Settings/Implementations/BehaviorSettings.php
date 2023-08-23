<?php

namespace Solspace\Freeform\Form\Settings\Implementations;

use Solspace\Freeform\Attributes\Form\SettingNamespace;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Section;
use Solspace\Freeform\Attributes\Property\Validators;
use Solspace\Freeform\Attributes\Property\ValueGenerator;
use Solspace\Freeform\Attributes\Property\VisibilityFilter;
use Solspace\Freeform\Bundles\Form\Limiting\FormLimiting;
use Solspace\Freeform\Form\Settings\Implementations\Options\FormLimitingOptions;
use Solspace\Freeform\Form\Settings\Implementations\Options\SuccessTemplateOptions;
use Solspace\Freeform\Form\Settings\Implementations\ValueGenerators\SuccessTemplateGenerator;
use Solspace\Freeform\Form\Settings\SettingsNamespace;

#[SettingNamespace(
    'Behavior',
    order: 2,
)]
class BehaviorSettings extends SettingsNamespace
{
    public const SUCCESS_BEHAVIOUR_RELOAD = 'reload';
    public const SUCCESS_BEHAVIOUR_REDIRECT_RETURN_URL = 'redirect-return-url';
    public const SUCCESS_BEHAVIOUR_LOAD_SUCCESS_TEMPLATE = 'load-success-template';

    private const SECTION_SUCCESS_AND_ERRORS = 'success-and-errors';
    private const SECTION_PROCESSING = 'processing';
    private const SECTION_LIMITS = 'limits';

    #[Section(
        self::SECTION_PROCESSING,
        label: 'Processing',
        icon: __DIR__.'/Icons/'.self::SECTION_PROCESSING.'.svg',
        order: 1,
    )]
    #[Input\Boolean(
        label: 'Use AJAX',
        instructions: 'Use built-in AJAX for this form when handling validation and submission of the form',
        order: 1,
    )]
    public bool $ajax = false;

    #[Section(self::SECTION_PROCESSING)]
    #[VisibilityFilter('Boolean(ajax)')]
    #[Input\Boolean(
        label: 'Show Processing Indicator on Submit',
        instructions: 'Show a spinner icon on the submit button when the user submits the form until it finishes processing.',
        order: 2,
    )]
    public bool $showProcessingSpinner = false;

    #[Section(self::SECTION_PROCESSING)]
    #[VisibilityFilter('Boolean(ajax)')]
    #[Input\Boolean(
        label: 'Show Processing Text on Submit',
        instructions: "Show 'processing' text on the submit button when the user submits the form until it finishes processing.",
        order: 3,
    )]
    public bool $showProcessingText = false;

    #[Section(self::SECTION_PROCESSING)]
    #[VisibilityFilter('Boolean(ajax)')]
    #[VisibilityFilter('Boolean(showProcessingText)')]
    #[Input\Text(
        'Processing Text',
        instructions: "Enter the text you'd like to appear on the submit button when the form is processing",
        order: 4,
    )]
    public string $processingText = 'Processing...';

    #[Section(
        self::SECTION_SUCCESS_AND_ERRORS,
        label: 'Success & Errors',
        icon: __DIR__.'/Icons/'.self::SECTION_SUCCESS_AND_ERRORS.'.svg',
        order: 2,
    )]
    #[Input\Select(
        instructions: "Select how you'd like the success return of this form to be handled. May also be overridden at the template level.",
        order: 1,
        options: [
            ['value' => self::SUCCESS_BEHAVIOUR_RELOAD, 'label' => 'Reload form with a Success banner above'],
            ['value' => self::SUCCESS_BEHAVIOUR_LOAD_SUCCESS_TEMPLATE, 'label' => 'Replace form with a Success message'],
            ['value' => self::SUCCESS_BEHAVIOUR_REDIRECT_RETURN_URL, 'label' => 'Redirect to another URL'],
        ],
    )]
    #[Validators\Required]
    public string $successBehavior = self::SUCCESS_BEHAVIOUR_LOAD_SUCCESS_TEMPLATE;

    #[Section(self::SECTION_SUCCESS_AND_ERRORS)]
    #[ValueGenerator(SuccessTemplateGenerator::class)]
    #[VisibilityFilter('successBehavior === "'.self::SUCCESS_BEHAVIOUR_LOAD_SUCCESS_TEMPLATE.'"')]
    #[Input\Select(
        instructions: "Select the template you'd like to replace the form in the page after a successful submit.",
        order: 2,
        options: SuccessTemplateOptions::class,
    )]
    public ?string $successTemplate;

    #[Section(self::SECTION_SUCCESS_AND_ERRORS)]
    #[VisibilityFilter('successBehavior === "'.self::SUCCESS_BEHAVIOUR_REDIRECT_RETURN_URL.'"')]
    #[Input\Text(
        label: 'Return URL',
        instructions: 'Set a URL for the form to be redirected to after successful submit.',
        order: 3,
    )]
    #[Validators\Required]
    public string $returnUrl = '/contact-us/thank-you/';

    #[Section(self::SECTION_SUCCESS_AND_ERRORS)]
    #[Input\TextArea(
        instructions: 'Enter text to be shown at the top of the form if the submit is successful (AJAX), or load in your template with {{ form.settings.successMessage }}.',
        order: 4,
        placeholder: 'e.g. Thanks for filling out the form and stuff!',
    )]
    public string $successMessage = 'Form has been submitted successfully!';

    #[Section(self::SECTION_SUCCESS_AND_ERRORS)]
    #[Input\TextArea(
        instructions: 'Enter the text to be shown at the top of the form if there are any errors in the form after submit (AJAX), or load in your template with {{ form.settings.errorMessage }}.',
        order: 5,
        placeholder: 'e.g. There was an error! Please fix!',
    )]
    public string $errorMessage = 'Sorry, there was an error submitting the form. Please try again.';

    #[Section(
        self::SECTION_LIMITS,
        label: 'Limits',
        icon: __DIR__.'/Icons/'.self::SECTION_LIMITS.'.svg',
        order: 3,
    )]
    #[Input\Select(
        label: 'Limit Form Submission Rate',
        instructions: 'Select an option for restricting users when submitting this form.',
        order: 1,
        options: FormLimitingOptions::class,
    )]
    public string $limitSubmissions = FormLimiting::NO_LIMIT;

    #[Section(self::SECTION_LIMITS)]
    #[Input\DatePicker(
        label: 'Stop Submissions After Date',
        instructions: 'Set a date after which this form will no longer accept new submissions.',
        order: 2,
    )]
    public ?string $stopSubmissionsAfter = null;
}
