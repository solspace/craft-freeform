<?php

namespace Solspace\Freeform\Integrations\Captchas\ReCaptcha;

use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Validators\Required;
use Solspace\Freeform\Attributes\Property\VisibilityFilter;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Integrations\BaseIntegration;
use Solspace\Freeform\Library\Integrations\Types\Captchas\CaptchaIntegrationInterface;

#[Type(
    name: 'reCAPTCHA',
    readme: __DIR__.'/README.md',
    iconPath: __DIR__.'/icon.svg',
)]
class ReCaptcha extends BaseIntegration implements CaptchaIntegrationInterface
{
    public const VERSION_V2_INVISIBLE = 'v2-invisible';
    public const VERSION_V2_CHECKBOX = 'v2-checkbox';
    public const VERSION_V3 = 'v3';

    public const BEHAVIOR_DISPLAY_ERROR = 'display-error';
    public const BEHAVIOR_SEND_TO_SPAM = 'send-to-spam';

    #[Required]
    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Flag(self::FLAG_ENCRYPTED)]
    #[Input\Text(
        label: 'Site Key',
        placeholder: 'Enter your site key',
    )]
    private ?string $siteKey = null;

    #[Required]
    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Flag(self::FLAG_ENCRYPTED)]
    #[Input\Text(
        label: 'Secret Key',
        placeholder: 'Enter your secret key',
    )]
    private ?string $secretKey = null;

    #[Input\Boolean(
        label: 'Only load Captcha scripts once the user interacts with the form?',
        instructions: "If you'd like to have the associated Captcha scripts load only once a user begins filling out the form, enable this setting. If you'd like your forms to be ready to go at page load, disable this setting.",
    )]
    private bool $triggerOnInteract = false;

    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Input\Select(
        label: 'Captcha Type',
        instructions: 'Choose which Captcha service and type you want to use',
        options: [
            self::VERSION_V2_INVISIBLE => 'reCAPTCHA v2 Invisible',
            self::VERSION_V2_CHECKBOX => 'reCAPTCHA v2 Checkbox',
            self::VERSION_V3 => 'reCAPTCHA v3',
        ],
    )]
    private string $version = self::VERSION_V2_INVISIBLE;

    #[VisibilityFilter('properties.version === "v2-checkbox"')]
    #[Input\Select(
        options: [
            'light' => 'Light',
            'dark' => 'Dark',
        ],
    )]
    private string $theme = 'light';

    #[VisibilityFilter('properties.version === "v2-checkbox"')]
    #[Input\Select(
        options: [
            'normal' => 'Normal',
            'compact' => 'Compact',
        ],
    )]
    private string $size = 'normal';

    #[VisibilityFilter('properties.version !== "v2-checkbox"')]
    #[Input\Select(
        label: 'Failure Behavior',
        options: [
            self::BEHAVIOR_DISPLAY_ERROR => 'Display Error',
            self::BEHAVIOR_SEND_TO_SPAM => 'Send to Spam',
        ],
    )]
    private string $failureBehavior = self::BEHAVIOR_DISPLAY_ERROR;

    #[VisibilityFilter('properties.version === "v3"')]
    #[Input\Select(
        label: 'Score Threshold',
        instructions: 'The minimum score required for the Captcha to pass validation. The score is a number between 0 and 1. A score of 0.5 is generally recommended.',
        options: [
            '0.0' => '0.0',
            '0.1' => '0.1',
            '0.2' => '0.2',
            '0.3' => '0.3',
            '0.4' => '0.4',
            '0.5' => '0.5',
            '0.6' => '0.6',
            '0.7' => '0.7',
            '0.8' => '0.8',
            '0.9' => '0.9',
            '1.0' => '1.0',
        ]
    )]
    private string $scoreThreshold = '0.5';

    #[Input\Text(
        label: 'Error Message',
        instructions: 'The error message to display when the Captcha validation fails.',
        placeholder: 'Please verify that you are not a robot.',
    )]
    private string $errorMessage = 'Please verify that you are not a robot.';

    public function validate(Form $form): bool
    {
        return false;
    }

    public function getErrorMessage(): string
    {
        return $this->errorMessage;
    }
}
