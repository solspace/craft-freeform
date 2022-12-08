<?php

namespace Solspace\Freeform\Form\Settings\Implementations;

use Solspace\Freeform\Attributes\Form\SettingNamespace;
use Solspace\Freeform\Attributes\Property\Property;
use Solspace\Freeform\Bundles\Form\Limiting\FormLimiting;
use Solspace\Freeform\Form\Settings\Implementations\Options\SuccessTemplateOptions;
use Solspace\Freeform\Form\Settings\SettingsNamespace;

#[SettingNamespace(
    label: 'Behavior',
    sections: [
        'Success & Errors',
        'Processing',
        'Limits',
    ],
)]
class BehaviorSettings extends SettingsNamespace
{
    public const SUCCESS_BEHAVIOUR_RELOAD = 'reload';
    public const SUCCESS_BEHAVIOUR_REDIRECT_RETURN_URL = 'redirect-return-url';
    public const SUCCESS_BEHAVIOUR_LOAD_SUCCESS_TEMPLATE = 'load-success-template';

    #[Property(
        type: Property::TYPE_SELECT,
        instructions: "Set how you'd like the success return of this form to be handled. May also be overridden at the template level.",
        options: [
            ['value' => self::SUCCESS_BEHAVIOUR_RELOAD, 'label' => 'Reload'],
            ['value' => self::SUCCESS_BEHAVIOUR_REDIRECT_RETURN_URL, 'label' => 'Redirect'],
            ['value' => self::SUCCESS_BEHAVIOUR_LOAD_SUCCESS_TEMPLATE, 'label' => 'Load success template'],
        ],
    )]
    public string $successBehavior = self::SUCCESS_BEHAVIOUR_RELOAD;

    #[Property(
        type: Property::TYPE_SELECT,
        options: SuccessTemplateOptions::class,
    )]
    public string $successTemplate = '';

    #[Property]
    public string $returnUrl = '/';

    #[Property(
        instructions: 'The text to be shown at the top of the form if the submit is successful (AJAX), or load in your template with form.successMessage.',
        placeholder: 'Form has been submitted successfully!',
    )]
    public string $successMessage = 'Form has been submitted successfully!';

    #[Property(
        instructions: 'The text to be shown at the top of the form if there are any errors upon submit (AJAX), or load in your template with form.errorMessage.',
        placeholder: 'Sorry, there was an error submitting the form. Please try again.',
    )]
    public string $errorMessage = 'Sorry, there was an error submitting the form. Please try again.';

    #[Property(
        label: 'Use AJAX',
        instructions: "Use Freeform's built-in automatic AJAX submit feature",
    )]
    public bool $ajax = true;

    #[Property(
        label: 'Show Processing Indicator on Submit',
        instructions: 'Show a loading indicator on the submit button upon submission of the form.',
    )]
    public bool $showSpinner = true;

    #[Property(
        label: 'Show Processing Text',
        instructions: "Enabling this will change the submit button's label to the text of your choice.",
    )]
    public bool $showLoadingText = true;

    #[Property(
        label: 'Processing Text',
    )]
    public string $loadingText = 'Loading...';

    #[Property(
        label: 'Limit Form Submission Rate',
        type: Property::TYPE_SELECT,
        options: [
            [
                'value' => FormLimiting::NO_LIMIT,
                'label' => 'Do not limit',
            ],
            [
                'value' => FormLimiting::NO_LIMIT_LOGGED_IN_USERS_ONLY,
                'label' => 'Logged in Users only (no limit)',
            ],
            [
                'value' => FormLimiting::LIMIT_COOKIE,
                'label' => 'Once per Cookie only',
            ],
            [
                'value' => FormLimiting::LIMIT_IP_COOKIE,
                'label' => 'Once per IP/Cookie combo',
            ],
            [
                'value' => FormLimiting::LIMIT_ONCE_PER_LOGGED_IN_USERS_ONLY,
                'label' => 'Once per logged in Users only',
            ],
            [
                'value' => FormLimiting::LIMIT_ONCE_PER_LOGGED_IN_USER_OR_GUEST_COOKIE_ONLY,
                'label' => 'Once per logged in User or Guest Cookie only',
            ],
            [
                'value' => FormLimiting::LIMIT_ONCE_PER_LOGGED_IN_USER_OR_GUEST_IP_COOKIE_COMBO,
                'label' => 'Once per logged in User or Guest IP/Cookie combo',
            ],
        ],
    )]
    public string $limitSubmissions = FormLimiting::NO_LIMIT;

    #[Property(
        type: Property::TYPE_DATE_PICKER,
        instructions: 'Set a date after which the form will no longer accept submissions.',
        group: 'limits',
    )]
    protected ?string $stopSubmissionsAfter = null;
}
