<?php

namespace Solspace\Freeform\Integrations\Captchas\ReCaptcha;

use GuzzleHttp\Client;
use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Middleware;
use Solspace\Freeform\Attributes\Property\Validators\Required;
use Solspace\Freeform\Attributes\Property\VisibilityFilter;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\DataObjects\SpamReason;
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

    #[Flag(self::FLAG_AS_HIDDEN_IN_INSTANCE)]
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

    #[VisibilityFilter('values.version === "v2-checkbox"')]
    #[Input\Select(
        options: [
            'light' => 'Light',
            'dark' => 'Dark',
        ],
    )]
    private string $theme = 'light';

    #[VisibilityFilter('values.version === "v2-checkbox"')]
    #[Input\Select(
        options: [
            'normal' => 'Normal',
            'compact' => 'Compact',
        ],
    )]
    private string $size = 'normal';

    #[VisibilityFilter('values.version !== "v2-checkbox"')]
    #[Input\Select(
        label: 'Failure Behavior',
        options: [
            self::BEHAVIOR_DISPLAY_ERROR => 'Display Error',
            self::BEHAVIOR_SEND_TO_SPAM => 'Send to Spam',
        ],
    )]
    private string $failureBehavior = self::BEHAVIOR_DISPLAY_ERROR;

    #[VisibilityFilter('values.version === "v3"')]
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

    #[VisibilityFilter('values.version === "v3"')]
    #[Middleware('regex', ['pattern' => '[^a-zA-Z0-9_]'])]
    #[Input\Text(
        instructions: 'The action to use when validating the Captcha. This is only used for reCAPTCHA v3.',
        placeholder: 'submit',
    )]
    private string $action = 'submit';

    #[Input\Text(
        label: 'Error Message',
        instructions: 'The error message to display when the Captcha validation fails.',
        placeholder: 'Please verify that you are not a robot.',
    )]
    private string $errorMessage = 'Please verify that you are not a robot.';

    public function getSiteKey(): ?string
    {
        return $this->getProcessedValue($this->siteKey);
    }

    public function getSecretKey(): ?string
    {
        return $this->getProcessedValue($this->secretKey);
    }

    public function isTriggerOnInteract(): bool
    {
        return $this->triggerOnInteract;
    }

    public function getVersion(): string
    {
        return $this->version;
    }

    public function getTheme(): string
    {
        return $this->theme;
    }

    public function getSize(): string
    {
        return $this->size;
    }

    public function getFailureBehavior(): string
    {
        return $this->failureBehavior;
    }

    public function getScoreThreshold(): string
    {
        return $this->scoreThreshold;
    }

    public function getAction(): string
    {
        return $this->action;
    }

    public function getErrorMessage(): string
    {
        return $this->errorMessage;
    }

    public function validate(Form $form): void
    {
        $settings = Freeform::getInstance()->settings->getSettingsModel();

        if ($settings->bypassSpamCheckOnLoggedInUsers && \Craft::$app->getUser()->id) {
            return;
        }

        if (!$form->isCaptchaEnabled()) {
            return;
        }

        $errors = $this->getValidationErrors($form);
        if (empty($errors)) {
            return;
        }

        $behavior = $this->getFailureBehavior();
        if (self::BEHAVIOR_DISPLAY_ERROR === $behavior) {
            $form->addError($this->getErrorMessage());
        } elseif (self::BEHAVIOR_SEND_TO_SPAM === $behavior) {
            $form->markAsSpam(SpamReason::TYPE_CAPTCHA, 'reCAPTCHA - '.implode(', ', $errors));
        }
    }

    private function getValidationErrors(Form $form): array
    {
        $client = new Client();
        $secret = $this->getSecretKey();
        $captchaResponse = $this->getCaptchaResponse($form);

        $response = $client->post('https://www.google.com/recaptcha/api/siteverify', [
            'form_params' => [
                'secret' => $secret,
                'response' => $captchaResponse,
                'remoteip' => \Craft::$app->request->getRemoteIP(),
            ],
        ]);

        $result = json_decode((string) $response->getBody(), true);

        $errors = [];
        if (isset($result['score'])) {
            $minScore = $this->getScoreThreshold();
            $minScore = min(1, $minScore);
            $minScore = max(0, $minScore);

            if ($result['score'] < $minScore) {
                $errors[] = 'Score check failed with ['.$result['score'].']';

                return $errors;
            }
        }

        if ($result['success']) {
            return [];
        }

        $errorCodes = $result['error-codes'];
        if (\in_array('missing-input-secret', $errorCodes, true)) {
            $errors[] = 'The secret parameter is missing.';
        }

        if (\in_array('invalid-input-secret', $errorCodes, true)) {
            $errors[] = 'The secret parameter is invalid or malformed.';
        }

        if (\in_array('missing-input-response', $errorCodes, true)) {
            $errors[] = 'The response parameter is missing.';
        }

        if (\in_array('invalid-input-response', $errorCodes, true)) {
            $errors[] = 'The response parameter is invalid or malformed.';
        }

        if (\in_array('bad-request', $errorCodes, true)) {
            $errors[] = 'The request is invalid or malformed.';
        }

        if (\in_array('timeout-or-duplicate', $errorCodes, true)) {
            $errors[] = 'The response is no longer valid: either is too old or has been used previously.';
        }

        if (empty($errors)) {
            $errors = $errorCodes;
        }

        return $errors;
    }

    private function getCaptchaResponse(Form $form): ?string
    {
        if ($form->isGraphQLPosted()) {
            $arguments = $form->getGraphQLArguments();

            if (!isset($arguments['reCaptcha'])) {
                return null;
            }

            $property = $arguments['reCaptcha'];
            if (empty($property['name']) || empty($property['value']) || 'g-recaptcha-response' !== $property['name']) {
                return null;
            }

            return $property['value'];
        }

        return \Craft::$app->request->post('g-recaptcha-response');
    }
}
