<?php

namespace Solspace\Freeform\Form\Settings\Implementations;

use Solspace\Freeform\Attributes\Form\SettingNamespace;
use Solspace\Freeform\Attributes\Property\DefaultValue;
use Solspace\Freeform\Attributes\Property\Edition;
use Solspace\Freeform\Attributes\Property\Implementations\Date\DateTimeTransformer;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Section;
use Solspace\Freeform\Attributes\Property\Translatable;
use Solspace\Freeform\Attributes\Property\Validators;
use Solspace\Freeform\Attributes\Property\ValueGenerator;
use Solspace\Freeform\Attributes\Property\ValueTransformer;
use Solspace\Freeform\Attributes\Property\VisibilityFilter;
use Solspace\Freeform\Bundles\Form\Limiting\DuplicateCheckScope;
use Solspace\Freeform\Bundles\Form\Limiting\FormLimiting;
use Solspace\Freeform\Bundles\Form\SuccessBehavior\SuccessBehaviorOptionsGenerator;
use Solspace\Freeform\Form\Settings\Implementations\Options\FormLimitingOptions;
use Solspace\Freeform\Form\Settings\Implementations\Options\SubmissionLimitPeriods;
use Solspace\Freeform\Form\Settings\Implementations\Options\SuccessTemplateOptions;
use Solspace\Freeform\Form\Settings\Implementations\ValueGenerators\SuccessTemplateGenerator;
use Solspace\Freeform\Form\Settings\SettingsNamespace;

#[SettingNamespace(
    'Behavior',
    order: 2,
)]
class BehaviorSettings extends SettingsNamespace
{
    public const SUCCESS_BEHAVIOR_RELOAD = 'reload';
    public const SUCCESS_BEHAVIOR_REDIRECT_RETURN_URL = 'redirect-return-url';
    public const SUCCESS_BEHAVIOR_LOAD_SUCCESS_TEMPLATE = 'load-success-template';
    public const SUCCESS_BEHAVIOR_REDIRECT_ENTRY = 'redirect-entry';

    private const SECTION_SUCCESS_AND_ERRORS = 'success-and-errors';
    private const SECTION_PROCESSING = 'processing';
    private const SECTION_LIMITS = 'limits';

    private const DEFAULT_SUCCESS_MESSAGE = 'Form has been submitted successfully!';
    private const DEFAULT_ERROR_MESSAGE = 'Sorry, there was an error submitting the form. Please try again.';

    #[Section(
        self::SECTION_PROCESSING,
        label: 'Processing',
        icon: __DIR__.'/Icons/'.self::SECTION_PROCESSING.'.svg',
        order: 1,
    )]
    #[DefaultValue('settings.processing.ajax')]
    #[Input\Boolean(
        label: 'Use AJAX',
        instructions: 'Use built-in AJAX for this form when handling validation and submission of the form',
        order: 1,
    )]
    public bool $ajax = false;

    #[Section(self::SECTION_PROCESSING)]
    #[DefaultValue('settings.processing.focusFirstError')]
    #[Input\Boolean(
        label: 'Focus First Error After Submit',
        instructions: 'After validation fails, move focus to the first visible field with an error, or to the error message if there are no field errors.',
        order: 2,
    )]
    public bool $focusFirstError = false;

    #[Section(self::SECTION_PROCESSING)]
    #[DefaultValue('settings.processing.showIndicator')]
    #[Input\Boolean(
        label: 'Show Processing Indicator on Submit',
        instructions: 'Show a spinner icon on the submit button when the user submits the form until it finishes processing.',
        order: 3,
    )]
    public bool $showProcessingSpinner = false;

    #[Section(self::SECTION_PROCESSING)]
    #[DefaultValue('settings.processing.showText')]
    #[Input\Boolean(
        label: 'Show Processing Text on Submit',
        instructions: "Show 'processing' text on the submit button when the user submits the form until it finishes processing.",
        order: 4,
    )]
    public bool $showProcessingText = false;

    #[Section(self::SECTION_PROCESSING)]
    #[DefaultValue('settings.processing.showOverlay')]
    #[Input\Boolean(
        label: 'Show Processing Overlay on Submit',
        instructions: 'Dim the form and show a centered spinner and processing message while a submission is being processed.',
        order: 5,
    )]
    public bool $showProcessingOverlay = false;

    #[Translatable]
    #[Section(self::SECTION_PROCESSING)]
    #[VisibilityFilter('Boolean(showProcessingText) || Boolean(showProcessingOverlay)')]
    #[DefaultValue('settings.processing.processingText')]
    #[Input\Text(
        'Processing Text',
        instructions: 'Text shown on the submit button or processing overlay when the form is processing.',
        order: 6,
    )]
    public string $processingText = 'Processing...';

    #[Section(
        self::SECTION_SUCCESS_AND_ERRORS,
        label: 'Success & Errors',
        icon: __DIR__.'/Icons/'.self::SECTION_SUCCESS_AND_ERRORS.'.svg',
        order: 2,
    )]
    #[Validators\Required]
    #[DefaultValue('settings.successAndErrors.successBehavior')]
    #[Input\Select(
        instructions: "Select how you'd like the success return of this form to be handled. May also be overridden at the template level.",
        order: 1,
        options: SuccessBehaviorOptionsGenerator::class,
    )]
    public string $successBehavior = self::SUCCESS_BEHAVIOR_RELOAD;

    #[Section(self::SECTION_SUCCESS_AND_ERRORS)]
    #[ValueGenerator(SuccessTemplateGenerator::class)]
    #[VisibilityFilter('successBehavior === "'.self::SUCCESS_BEHAVIOR_LOAD_SUCCESS_TEMPLATE.'"')]
    #[DefaultValue('settings.successAndErrors.successTemplate')]
    #[Input\Select(
        instructions: "Select the template you'd like to replace the form in the page after a successful submit.",
        order: 2,
        emptyOption: 'Choose a template',
        options: SuccessTemplateOptions::class,
    )]
    public ?string $successTemplate;

    #[Section(self::SECTION_SUCCESS_AND_ERRORS)]
    #[VisibilityFilter('successBehavior === "'.self::SUCCESS_BEHAVIOR_REDIRECT_RETURN_URL.'"')]
    #[DefaultValue('settings.successAndErrors.returnUrl')]
    #[Input\Text(
        label: 'Return URL',
        instructions: 'Set a URL for the form to be redirected to after successful submit.',
        order: 3,
    )]
    public string $returnUrl = '';

    #[Section(self::SECTION_SUCCESS_AND_ERRORS)]
    #[VisibilityFilter('successBehavior === "'.self::SUCCESS_BEHAVIOR_REDIRECT_ENTRY.'"')]
    #[DefaultValue('settings.successAndErrors.entry')]
    #[Input\EntryPicker(
        label: 'Redirect Entry',
        instructions: 'Select an entry for the user to be redirected to.',
        order: 3,
        actionLabel: 'Select Entry',
        multiSelect: false,
        limit: 1,
    )]
    public array $entryId = [];

    #[Translatable]
    #[Section(self::SECTION_SUCCESS_AND_ERRORS)]
    #[DefaultValue('settings.successAndErrors.successMessage')]
    #[Input\TextArea(
        instructions: 'Enter text to be shown at the top of the form if the submit is successful (AJAX), or load in your template with `{{ form.settings.successMessage }}`.',
        order: 4,
        placeholder: 'e.g. Form has been submitted successfully!',
    )]
    public string $successMessage = self::DEFAULT_SUCCESS_MESSAGE;

    #[Translatable]
    #[Section(self::SECTION_SUCCESS_AND_ERRORS)]
    #[DefaultValue('settings.successAndErrors.errorMessage')]
    #[Input\TextArea(
        instructions: 'Enter the text to be shown at the top of the form if there are any errors in the form after submit (AJAX), or load in your template with `{{ form.settings.errorMessage }}`.',
        order: 5,
        placeholder: 'e.g. Sorry, there was an error submitting the form. Please try again.',
    )]
    public string $errorMessage = self::DEFAULT_ERROR_MESSAGE;

    #[Section(
        self::SECTION_LIMITS,
        label: 'Limits',
        icon: __DIR__.'/Icons/'.self::SECTION_LIMITS.'.svg',
        order: 3,
    )]
    #[Edition(Edition::PRO)]
    #[DefaultValue('settings.limits.duplicateCheck')]
    #[Input\Select(
        label: 'Duplicate Check',
        instructions: 'Select an option for restricting users when submitting this form.',
        order: 1,
        options: FormLimitingOptions::class,
    )]
    public string $duplicateCheck = FormLimiting::NO_LIMIT;

    #[Section(self::SECTION_LIMITS)]
    #[Edition(Edition::PRO)]
    #[VisibilityFilter('duplicateCheck !== "no_limit" && duplicateCheck !== "no_limit_logged_in_users_only"')]
    #[Input\Field(
        label: 'Scope by Field',
        instructions: 'Limit repeat submissions to the same value of this field, such as a product or entry ID. Leave blank to check the entire form. Requires stored submissions and a nonempty field value.',
        order: 2,
        emptyOption: 'Entire form (no field scope)',
        availableFieldTypes: DuplicateCheckScope::FIELD_TYPES,
    )]
    public ?string $duplicateCheckScopeField = null;

    #[Section(self::SECTION_LIMITS)]
    #[Edition(Edition::LITE)]
    #[Input\Boolean(
        label: 'Schedule Form',
        instructions: 'Make this form available only during a scheduled period.',
        order: 3,
    )]
    public ?bool $scheduleEnabled = null;

    #[Section(self::SECTION_LIMITS)]
    #[Edition(Edition::LITE)]
    #[VisibilityFilter('Boolean(scheduleEnabled)')]
    #[ValueTransformer(DateTimeTransformer::class)]
    #[Input\DatePicker(
        label: 'Schedule Start Date',
        instructions: 'When the form becomes available. Leave blank to make it available immediately.',
        order: 4,
        includeTime: true,
    )]
    public ?\DateTime $startSubmissionsAt = null;

    #[Section(self::SECTION_LIMITS)]
    #[Edition(Edition::LITE)]
    #[VisibilityFilter('Boolean(scheduleEnabled)')]
    #[ValueTransformer(DateTimeTransformer::class)]
    #[Input\DatePicker(
        label: 'Schedule End Date',
        instructions: 'When the form stops being available and accepting submissions. Leave blank for no end date.',
        order: 5,
        includeTime: true,
        defaultTime: '23:59',
    )]
    public ?\DateTime $stopSubmissionsAfter = null;

    #[Translatable]
    #[Section(self::SECTION_LIMITS)]
    #[Edition(Edition::LITE)]
    #[VisibilityFilter('Boolean(scheduleEnabled)')]
    #[Input\TextArea(
        label: 'Pending Message',
        instructions: 'Shown instead of the form before its start date. Leave blank to hide the form without a message.',
        order: 6,
    )]
    public string $schedulePendingMessage = 'This form is not available yet.';

    #[Translatable]
    #[Section(self::SECTION_LIMITS)]
    #[Edition(Edition::LITE)]
    #[VisibilityFilter('Boolean(scheduleEnabled)')]
    #[Input\TextArea(
        label: 'Expired Message',
        instructions: 'Shown instead of the form after its end date. Leave blank to hide the form without a message.',
        order: 7,
    )]
    public string $scheduleExpiredMessage = 'This form is no longer available.';

    #[Section(self::SECTION_LIMITS)]
    #[Edition(Edition::LITE)]
    #[Input\Boolean(
        label: 'Limit Submissions',
        instructions: 'Limit the number of stored submissions this form accepts. Template submissionLimit overrides take precedence.',
        order: 8,
    )]
    public bool $submissionLimitEnabled = false;

    #[Section(self::SECTION_LIMITS)]
    #[Edition(Edition::LITE)]
    #[VisibilityFilter('Boolean(submissionLimitEnabled)')]
    #[Input\Integer(
        label: 'Number of Submissions',
        unit: 'submissions',
        instructions: 'The maximum number of submissions to accept. Requires Store Submitted Data to be enabled. Spam and deleted submissions are excluded.',
        order: 9,
        min: 1,
        step: 1,
    )]
    public int $submissionLimit = 50;

    #[Section(self::SECTION_LIMITS)]
    #[Edition(Edition::LITE)]
    #[VisibilityFilter('Boolean(submissionLimitEnabled)')]
    #[Input\Select(
        label: 'Limit Period',
        instructions: 'Calendar periods use Craft\'s timezone and configured week start. Total never resets.',
        order: 10,
        options: SubmissionLimitPeriods::class,
    )]
    public string $submissionLimitPeriod = 'total';

    #[Translatable]
    #[Section(self::SECTION_LIMITS)]
    #[Edition(Edition::LITE)]
    #[VisibilityFilter('Boolean(submissionLimitEnabled)')]
    #[Input\TextArea(
        label: 'Limit Reached Message',
        instructions: 'Shown instead of the form when its submission limit is reached. Leave blank to hide the form without a message.',
        order: 11,
    )]
    public string $submissionLimitMessage = 'Submission limit reached';

    public function normalizeSchedule(): void
    {
        if (null !== $this->scheduleEnabled) {
            return;
        }

        // Existing date-only cutoffs continue to include the entire final day.
        $this->scheduleEnabled = null !== $this->stopSubmissionsAfter;
        if ($this->stopSubmissionsAfter) {
            $this->stopSubmissionsAfter = clone $this->stopSubmissionsAfter;
            $this->stopSubmissionsAfter->setTime(23, 59, 59);
        }
    }

    public function getSuccessMessage(): string
    {
        return $this->successMessage ?: self::DEFAULT_SUCCESS_MESSAGE;
    }

    public function getErrorMessage(): string
    {
        return $this->errorMessage ?: self::DEFAULT_ERROR_MESSAGE;
    }

    public function getProcessingText(): string
    {
        return $this->processingText;
    }
}
