<?php

namespace Solspace\Freeform\Integrations\Captchas\ReCaptcha;

use GuzzleHttp\ClientInterface;
use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Middleware;
use Solspace\Freeform\Attributes\Property\Validators\Required;
use Solspace\Freeform\Attributes\Property\VisibilityFilter;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Integrations\Captchas\CaptchasBundle;
use Solspace\Freeform\Library\DataObjects\SpamReason;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;
use Solspace\Freeform\Library\Integrations\BaseIntegration;
use Solspace\Freeform\Library\Integrations\EnabledByDefault\EnabledByDefaultTrait;
use Solspace\Freeform\Library\Integrations\Types\Captchas\CaptchaIntegrationInterface;
use Solspace\Freeform\Services\Headless\HeadlessPayloadHelper;

#[Type(
    name: 'reCAPTCHA',
    type: Type::TYPE_CAPTCHAS,
    readme: __DIR__.'/README.md',
    iconPath: __DIR__.'/icon.svg',
)]
class ReCaptcha extends BaseIntegration implements CaptchaIntegrationInterface
{
    use EnabledByDefaultTrait;

    public const VERSION_V3 = 'v3';
    public const VERSION_V2_INVISIBLE = 'v2-invisible';
    public const VERSION_V2_CHECKBOX = 'v2-checkbox';

    public const MODE_LEGACY = 'legacy';
    public const MODE_ENTERPRISE = 'enterprise';
    public const FRONTEND_MANAGED = 'managed';
    public const FRONTEND_EXTERNAL = 'external';

    public const BEHAVIOR_DISPLAY_ERROR = 'display-error';
    public const BEHAVIOR_SEND_TO_SPAM = 'send-to-spam';

    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Flag(self::FLAG_AS_HIDDEN_IN_INSTANCE)]
    #[Input\ButtonGroup(
        label: 'Setup',
        instructions: 'Choose the setup that matches your Google credentials.',
        options: [self::MODE_ENTERPRISE => 'Google Cloud (Enterprise)', self::MODE_LEGACY => 'Legacy (Site Key + Secret Key)'],
        order: 1,
    )]
    private string $verificationMode = self::MODE_LEGACY;

    #[Flag(self::FLAG_AS_HIDDEN_IN_INSTANCE)]
    #[Input\ButtonGroup(
        label: 'Captcha Type',
        instructions: 'Choose the type of website key you created in Google.',
        options: [
            self::VERSION_V3 => 'Score Based (v3)',
            self::VERSION_V2_INVISIBLE => 'Challenge - Invisible (v2)',
            self::VERSION_V2_CHECKBOX => 'Challenge - Checkbox (v2)',
        ],
    )]
    private string $version = self::VERSION_V2_CHECKBOX;

    #[Required]
    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Flag(self::FLAG_ENCRYPTED)]
    #[Flag(self::FLAG_ENV_SUGGEST)]
    #[Input\Text(
        label: 'Site Key',
        instructions: 'Copy the site key from your reCAPTCHA key details in Google.',
        placeholder: 'Enter your site key',
    )]
    private ?string $siteKey = null;

    #[Required]
    #[VisibilityFilter('!values.verificationMode || values.verificationMode === "legacy"')]
    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Flag(self::FLAG_ENCRYPTED)]
    #[Flag(self::FLAG_ENV_SUGGEST)]
    #[Input\Text(
        label: 'Secret Key',
        instructions: 'For Google Cloud keys, open the key’s Integration tab and copy its legacy secret key.',
        placeholder: 'Enter your secret key',
    )]
    private ?string $secretKey = null;

    #[Required]
    #[VisibilityFilter('values.verificationMode === "enterprise"')]
    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Flag(self::FLAG_ENV_SUGGEST)]
    #[Input\Text(
        label: 'Google Cloud Project ID',
        instructions: 'Copy the project ID from the Google Cloud project selector, not the project name.',
        placeholder: 'my-project-id',
    )]
    private string $projectId = '';

    #[Required]
    #[VisibilityFilter('values.verificationMode === "enterprise"')]
    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Flag(self::FLAG_ENCRYPTED)]
    #[Flag(self::FLAG_ENV_SUGGEST)]
    #[Input\Text(
        label: 'Google Cloud API Key',
        instructions: 'Create a server API key in the same Google Cloud project and restrict it to the reCAPTCHA Enterprise API. This key stays on your server.',
    )]
    private string $apiKey = '';

    #[VisibilityFilter('Boolean(enabled)')]
    #[Input\Boolean(label: 'Advanced settings', instructions: 'Appearance, verification, and developer options.', order: 90)]
    private bool $showAdvanced = false;

    #[VisibilityFilter('Boolean(enabled)')]
    #[VisibilityFilter('Boolean(values.showAdvanced)')]
    #[Input\ButtonGroup(
        label: 'JavaScript setup',
        instructions: 'Freeform adds reCAPTCHA to your forms. Choose Custom JavaScript if your site already loads it. Freeform still verifies submissions.',
        options: [self::FRONTEND_MANAGED => 'Managed by Freeform', self::FRONTEND_EXTERNAL => 'Custom JavaScript'],
        order: 100,
    )]
    private string $frontendMode = self::FRONTEND_MANAGED;

    #[VisibilityFilter('Boolean(enabled)')]
    #[VisibilityFilter('Boolean(values.showAdvanced)')]
    #[Input\ButtonGroup(
        label: 'reCAPTCHA domain',
        instructions: 'Use google.com unless it is blocked for your visitors. Use recaptcha.net in that case.',
        options: ['google.com' => 'google.com', 'recaptcha.net' => 'recaptcha.net'],
        order: 101,
    )]
    private string $scriptDomain = 'google.com';

    #[VisibilityFilter('Boolean(enabled)')]
    #[VisibilityFilter('Boolean(values.showAdvanced)')]
    #[Flag(self::FLAG_ENV_SUGGEST)]
    #[Input\TextArea(
        label: 'Allowed website domains',
        instructions: 'Enter one exact domain per line. Leave blank to use Google’s domain checks. This is required if domain checks are turned off in Google.',
        placeholder: "example.com\nwww.example.com",
        order: 102,
    )]
    private string $allowedHostnames = '';

    #[VisibilityFilter('Boolean(enabled) && values.frontendMode !== "external"')]
    #[Input\BooleanEnv(
        label: 'Only load Captcha scripts once the user interacts with the form',
        instructions: "If you'd like to have the associated Captcha scripts load only once a user begins filling out the form, enable this setting. If you'd like your forms to be ready to go at page load, disable this setting.",
    )]
    private string $triggerOnInteract = 'false';

    #[VisibilityFilter('Boolean(enabled)')]
    #[Input\ButtonGroup(
        label: 'Failure Behavior',
        options: [
            self::BEHAVIOR_SEND_TO_SPAM => 'Send to Spam Folder',
            self::BEHAVIOR_DISPLAY_ERROR => 'Display Error Message',
        ],
    )]
    private string $failureBehavior = self::BEHAVIOR_DISPLAY_ERROR;

    #[VisibilityFilter('Boolean(enabled)')]
    #[VisibilityFilter('values.failureBehavior === "display-error"')]
    #[Flag(self::FLAG_ENV_SUGGEST)]
    #[Input\Text(
        label: 'Error Message',
        instructions: 'The error message to display when the Captcha validation fails.',
        placeholder: 'Please verify that you are not a robot.',
    )]
    private string $errorMessage = 'Please verify that you are not a robot.';

    #[VisibilityFilter('Boolean(enabled)')]
    #[VisibilityFilter('values.version === "v2-checkbox"')]
    #[VisibilityFilter('Boolean(values.showAdvanced)')]
    #[Input\ButtonGroup(
        label: 'Checkbox theme',
        instructions: 'Use the light or dark style for the checkbox.',
        options: [
            'light' => 'Light',
            'dark' => 'Dark',
        ],
        order: 103,
    )]
    private string $theme = 'light';

    #[VisibilityFilter('Boolean(enabled)')]
    #[VisibilityFilter('values.version === "v2-checkbox"')]
    #[VisibilityFilter('Boolean(values.showAdvanced)')]
    #[Input\ButtonGroup(
        label: 'Checkbox size',
        instructions: 'Choose Compact when the checkbox needs to fit a narrow form.',
        options: [
            'normal' => 'Normal',
            'compact' => 'Compact',
        ],
        order: 104,
    )]
    private string $size = 'normal';

    #[VisibilityFilter('Boolean(enabled)')]
    #[VisibilityFilter('values.version === "v3"')]
    #[Input\Select(
        label: 'Score Threshold',
        instructions: 'Scores below this value fail verification. Higher values are stricter and may reject more real visitors. 0.5 is recommended.',
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
        ],
        order: 80,
    )]
    private string $scoreThreshold = '0.5';

    #[VisibilityFilter('Boolean(enabled)')]
    #[VisibilityFilter('values.version === "v3"')]
    #[VisibilityFilter('Boolean(values.showAdvanced)')]
    #[Flag(self::FLAG_ENV_SUGGEST)]
    #[Middleware('regex', ['pattern' => '[^a-zA-Z0-9_/]'])]
    #[Input\Text(
        label: 'Google action name',
        instructions: 'Use `submit` for most forms. If you use Custom JavaScript, enter the action name used by that code.',
        placeholder: 'submit',
        order: 106,
    )]
    private string $action = 'submit';

    #[VisibilityFilter('Boolean(enabled)')]
    #[VisibilityFilter('Boolean(values.showAdvanced)')]
    #[Flag(self::FLAG_ENV_SUGGEST)]
    #[Input\Text(
        label: 'reCAPTCHA language',
        instructions: 'Leave blank to choose the language automatically. To set a language, enter a Google language code such as `en`, `fr`, or `de`.',
        placeholder: 'Automatic',
        order: 107,
    )]
    private string $locale = '';

    public function getSiteKey(): ?string
    {
        return trim((string) $this->getProcessedValue($this->siteKey)) ?: null;
    }

    public function getVerificationMode(): string
    {
        return $this->verificationMode;
    }

    public function getProjectId(): string
    {
        return trim((string) $this->getProcessedValue($this->projectId));
    }

    public function getApiKey(): string
    {
        return trim((string) $this->getProcessedValue($this->apiKey));
    }

    public function getFrontendMode(): string
    {
        return $this->frontendMode;
    }

    public function getScriptDomain(): string
    {
        return $this->scriptDomain;
    }

    public function getAllowedHostnames(): array
    {
        $hostnames = preg_split('/[\s,]+/', strtolower(trim((string) $this->getProcessedValue($this->allowedHostnames))), -1, \PREG_SPLIT_NO_EMPTY);

        return array_values(array_unique(array_map(static fn (string $host): string => rtrim($host, '.'), $hostnames)));
    }

    public function onBeforeSave(): void
    {
        if ('' === trim((string) $this->siteKey)) {
            throw new IntegrationException('A reCAPTCHA Site Key is required.');
        }
        if (!\in_array($this->verificationMode, [self::MODE_LEGACY, self::MODE_ENTERPRISE], true)
            || !\in_array($this->version, [self::VERSION_V2_CHECKBOX, self::VERSION_V2_INVISIBLE, self::VERSION_V3], true)
            || !\in_array($this->frontendMode, [self::FRONTEND_MANAGED, self::FRONTEND_EXTERNAL], true)
            || !\in_array($this->scriptDomain, ['google.com', 'recaptcha.net'], true)
        ) {
            throw new IntegrationException('Choose a supported reCAPTCHA API, key type, frontend, and script domain.');
        }

        if (self::MODE_ENTERPRISE === $this->verificationMode) {
            if (self::VERSION_V2_INVISIBLE === $this->version) {
                throw new IntegrationException('Enterprise supports Checkbox and Score Based keys. Use Legacy for Invisible v2.');
            }
            if ('' === trim($this->projectId) || '' === trim($this->apiKey)) {
                throw new IntegrationException('Enterprise requires a Google Cloud Project ID and Google Cloud API Key.');
            }
        } elseif ('' === trim((string) $this->secretKey)) {
            throw new IntegrationException('Legacy verification requires a Secret Key. Google Cloud keys use their legacy secret key.');
        }

        if (!str_starts_with($this->allowedHostnames, '$')) {
            foreach ($this->getAllowedHostnames() as $hostname) {
                if (!preg_match('/^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/D', $hostname)) {
                    throw new IntegrationException('Enter website domains without https://, paths, ports, or wildcards.');
                }
            }
        }
    }

    public function getSecretKey(): ?string
    {
        return trim((string) $this->getProcessedValue($this->secretKey)) ?: null;
    }

    public function isTriggerOnInteract(): bool
    {
        return $this->getProcessedBoolean($this->triggerOnInteract);
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
        return trim((string) $this->getProcessedValue($this->action)) ?: 'submit';
    }

    public function getErrorMessage(): string
    {
        return $this->errorMessage;
    }

    public function getLocale(): string
    {
        return strtolower(trim((string) $this->getProcessedValue($this->locale)));
    }

    public function validate(Form $form): void
    {
        $settings = Freeform::getInstance()->settings;
        if ($settings->isBypassSpamCheckOnLoggedInUsers() && \Craft::$app->getUser()->id) {
            return;
        }

        if (!$form->isCaptchaEnabled()) {
            return;
        }

        // If no token was submitted, reCAPTCHA never loaded on the client side. Always show an error so the user knows their submission did not go through, regardless of the configured failure behavior.
        $formHandle = $form->getHandle();

        if (empty($this->getCaptchaResponse($form))) {
            $form->addError($this->getErrorMessage());

            $this->logger->debug('reCAPTCHA validation failed: token missing, reCAPTCHA may not have loaded', ['form' => $formHandle]);

            return;
        }

        $result = (new ReCaptchaVerifier($this->createClient()))->verify(
            $this,
            $this->getCaptchaResponse($form),
            \Craft::$app->request->getUserIP(),
            (string) \Craft::$app->request->getUserAgent(),
        );
        $errors = $result->errors;
        if ($result->serviceError) {
            $form->addError($this->getErrorMessage());
            $this->logger->error('reCAPTCHA verification unavailable', ['form' => $formHandle, 'errors' => $errors]);

            return;
        }
        if (empty($errors)) {
            $this->logger->debug('reCAPTCHA validation passed', ['form' => $formHandle]);

            return;
        }

        $this->logger->debug('reCAPTCHA validation failed', ['form' => $formHandle, 'errors' => $errors]);

        $behavior = $this->getFailureBehavior();
        if (self::BEHAVIOR_DISPLAY_ERROR === $behavior) {
            $form->addError($this->getErrorMessage());
        } elseif (self::BEHAVIOR_SEND_TO_SPAM === $behavior) {
            $form->markAsSpam(SpamReason::TYPE_CAPTCHA, 'reCAPTCHA ['.$formHandle.'] - '.implode(', ', $errors));
        }
    }

    public function getHtmlTag(Form $form): string
    {
        if (self::FRONTEND_EXTERNAL === $this->frontendMode) {
            return '';
        }

        $locale = $this->getLocale();
        if (empty($locale)) {
            $locale = \Craft::$app->locale->getLanguageID();
        }

        $attributes = CaptchasBundle::getCaptchaAttributes($form);
        $attributes
            ->replace('data-freeform-recaptcha-container')
            ->replace('data-captcha', 'recaptcha')
            ->setIfEmpty('data-sitekey', $this->getSiteKey())
            ->setIfEmpty('data-theme', $this->getTheme())
            ->setIfEmpty('data-size', $this->getSize())
            ->setIfEmpty('data-lazy-load', $this->isTriggerOnInteract())
            ->setIfEmpty('data-version', $this->getVersion())
            ->setIfEmpty('data-verification-mode', $this->getVerificationMode())
            ->setIfEmpty('data-script-domain', $this->getScriptDomain())
            ->setIfEmpty('data-action', $this->getAction())
            ->setIfEmpty('data-locale', $locale)
        ;

        return '<div'.$attributes.'></div>';
    }

    public function getScriptPaths(): array
    {
        if (self::FRONTEND_EXTERNAL === $this->frontendMode) {
            return [];
        }

        $version = $this->getVersion();

        return [
            'js/scripts/front-end/captchas/recaptcha/'.$version.'.js',
        ];
    }

    public function getCaptchaHandle(): string
    {
        return 'g-recaptcha-response';
    }

    protected function createClient(): ClientInterface
    {
        return \Craft::createGuzzleClient();
    }

    private function getCaptchaResponse(Form $form): ?string
    {
        if ($form->isGraphQLPosted()) {
            $arguments = $form->getGraphQLArguments();

            if (!isset($arguments['captcha'])) {
                return null;
            }

            $property = $arguments['captcha'];
            if (!\is_array($property) || !\is_string($property['value'] ?? null) || empty($property['value']) || 'g-recaptcha-response' !== ($property['name'] ?? null)) {
                return null;
            }

            return $property['value'];
        }

        if ($form->isHeadlessPosted()) {
            return HeadlessPayloadHelper::getCaptchaResponse($form, 'g-recaptcha-response');
        }

        $token = \Craft::$app->request->post('g-recaptcha-response');

        return \is_string($token) ? $token : null;
    }
}
