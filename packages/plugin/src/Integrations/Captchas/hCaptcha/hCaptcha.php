<?php

namespace Solspace\Freeform\Integrations\Captchas\hCaptcha;

use GuzzleHttp\ClientInterface;
use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Validators\Required;
use Solspace\Freeform\Attributes\Property\VisibilityFilter;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Integrations\Captchas\CaptchasBundle;
use Solspace\Freeform\Integrations\Captchas\CaptchaVerificationResult;
use Solspace\Freeform\Integrations\Captchas\CaptchaVerifier;
use Solspace\Freeform\Library\DataObjects\SpamReason;
use Solspace\Freeform\Library\Integrations\BaseIntegration;
use Solspace\Freeform\Library\Integrations\EnabledByDefault\EnabledByDefaultTrait;
use Solspace\Freeform\Library\Integrations\Types\Captchas\CaptchaIntegrationInterface;
use Solspace\Freeform\Services\Headless\HeadlessPayloadHelper;

#[Type(
    name: 'hCaptcha',
    type: Type::TYPE_CAPTCHAS,
    readme: __DIR__.'/README.md',
    iconPath: __DIR__.'/icon.svg',
)]
class hCaptcha extends BaseIntegration implements CaptchaIntegrationInterface
{
    use EnabledByDefaultTrait;

    public const VERSION_INVISIBLE = 'invisible';
    public const VERSION_CHECKBOX = 'checkbox';

    public const BEHAVIOR_DISPLAY_ERROR = 'display-error';
    public const BEHAVIOR_SEND_TO_SPAM = 'send-to-spam';

    #[Flag(self::FLAG_AS_HIDDEN_IN_INSTANCE)]
    #[Input\ButtonGroup(
        label: 'Captcha Type',
        order: 1,
        instructions: 'Choose whether visitors see a checkbox before submitting.',
        options: [
            self::VERSION_INVISIBLE => 'Invisible',
            self::VERSION_CHECKBOX => 'Checkbox',
        ],
    )]
    private string $version = self::VERSION_INVISIBLE;

    #[Required]
    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Flag(self::FLAG_ENCRYPTED)]
    #[Flag(self::FLAG_ENV_SUGGEST)]
    #[Input\Text(
        label: 'Site Key',
        order: 10,
        instructions: 'Copy the site key from the provider’s dashboard.',
        placeholder: 'Enter your site key',
    )]
    private ?string $siteKey = null;

    #[Required]
    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Flag(self::FLAG_ENCRYPTED)]
    #[Flag(self::FLAG_ENV_SUGGEST)]
    #[Input\Text(
        label: 'Secret Key',
        order: 11,
        instructions: 'Copy the secret key from the provider’s dashboard. This stays on your server.',
        placeholder: 'Enter your secret key',
    )]
    private ?string $secretKey = null;

    #[VisibilityFilter('Boolean(enabled)')]
    #[Input\Boolean(label: 'Advanced settings', instructions: 'Appearance and language options.', order: 90)]
    private bool $showAdvanced = false;

    #[VisibilityFilter('Boolean(enabled)')]
    #[Input\BooleanEnv(
        label: 'Only load Captcha scripts once the user interacts with the form',
        order: 20,
        instructions: 'Enable to wait until the visitor starts filling out the form. Disable to load when the page opens.',
    )]
    private string $triggerOnInteract = 'false';

    #[VisibilityFilter('Boolean(values.showAdvanced)')]
    #[VisibilityFilter('Boolean(enabled)')]
    #[VisibilityFilter('values.version === "checkbox"')]
    #[Input\ButtonGroup(
        label: 'Widget theme',
        instructions: 'Choose Light or Dark to match your form.',
        order: 100,
        options: [
            'light' => 'Light',
            'dark' => 'Dark',
        ],
    )]
    private string $theme = 'light';

    #[VisibilityFilter('Boolean(values.showAdvanced)')]
    #[VisibilityFilter('Boolean(enabled)')]
    #[VisibilityFilter('values.version === "checkbox"')]
    #[Input\ButtonGroup(
        label: 'Widget size',
        instructions: 'Compact fits narrow forms. Normal uses the standard checkbox size.',
        order: 101,
        options: [
            'normal' => 'Normal',
            'compact' => 'Compact',
        ],
    )]
    private string $size = 'normal';

    #[VisibilityFilter('Boolean(enabled)')]
    #[Input\ButtonGroup(
        label: 'Failure Behavior',
        order: 30,
        options: [
            self::BEHAVIOR_SEND_TO_SPAM => 'Send to Spam Folder',
            self::BEHAVIOR_DISPLAY_ERROR => 'Display Error Message',
        ],
    )]
    private string $failureBehavior = self::BEHAVIOR_DISPLAY_ERROR;

    #[VisibilityFilter('Boolean(enabled)')]
    #[VisibilityFilter('values.failureBehavior !== "send-to-spam"')]
    #[Flag(self::FLAG_ENV_SUGGEST)]
    #[Input\Text(
        label: 'Error Message',
        order: 31,
        instructions: 'Shown when verification fails or cannot be completed. Visitors can try again.',
        placeholder: 'Please verify that you are not a robot.',
    )]
    private string $errorMessage = 'Please verify that you are not a robot.';

    #[VisibilityFilter('Boolean(values.showAdvanced)')]
    #[VisibilityFilter('Boolean(enabled)')]
    #[Flag(self::FLAG_ENV_SUGGEST)]
    #[Input\Text(
        label: 'hCaptcha language',
        instructions: 'Leave blank for automatic selection. To choose a language, enter a code such as `en`, `fr`, or `de`.',
        placeholder: 'Automatic',
        order: 105,
    )]
    private string $locale = '';

    public function getSiteKey(): ?string
    {
        return trim((string) $this->getProcessedValue($this->siteKey)) ?: null;
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

    public function getErrorMessage(): string
    {
        return $this->errorMessage ?: 'Please verify that you are not a robot.';
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

        // If no token was submitted, hCaptcha never loaded on the client side. Always show an error so the user knows their submission did not go through, regardless of the configured failure behavior.
        $formHandle = $form->getHandle();

        if (empty($this->getCaptchaResponse($form))) {
            $form->addError($this->getErrorMessage());

            $this->logger->debug('hCaptcha validation failed: token missing, hCaptcha may not have loaded', ['form' => $formHandle]);

            return;
        }

        $result = $this->verifyToken($form);
        if ($result->serviceError) {
            $form->addError($this->getErrorMessage());
            $this->logger->error('hCaptcha verification unavailable', ['form' => $formHandle, 'errors' => $result->errors]);

            return;
        }
        $errors = $result->errors;
        if (empty($errors)) {
            $this->logger->debug('hCaptcha validation passed', ['form' => $formHandle]);

            return;
        }

        $this->logger->debug('hCaptcha validation failed', ['form' => $formHandle, 'errors' => $errors]);

        $behavior = $this->getFailureBehavior();
        if (self::BEHAVIOR_DISPLAY_ERROR === $behavior) {
            $form->addError($this->getErrorMessage());
        } elseif (self::BEHAVIOR_SEND_TO_SPAM === $behavior) {
            $form->markAsSpam(SpamReason::TYPE_CAPTCHA, 'hCaptcha ['.$formHandle.'] - '.implode(', ', $errors));
        }
    }

    public function getHtmlTag(Form $form): string
    {
        $locale = $this->getLocale();
        if (empty($locale)) {
            $locale = \Craft::$app->locale->getLanguageID();
        }

        $attributes = CaptchasBundle::getCaptchaAttributes($form);
        $attributes
            ->replace('data-freeform-hcaptcha-container', true)
            ->replace('data-captcha', 'hcaptcha')
            ->setIfEmpty('data-sitekey', $this->getSiteKey())
            ->setIfEmpty('data-theme', $this->getTheme())
            ->setIfEmpty('data-size', $this->getSize())
            ->setIfEmpty('data-lazy-load', $this->isTriggerOnInteract())
            ->setIfEmpty('data-version', $this->getVersion())
            ->setIfEmpty('data-locale', $locale)
        ;

        return '<div'.$attributes.'></div>';
    }

    public function getScriptPaths(): array
    {
        $version = $this->getVersion();

        return [
            'js/scripts/front-end/captchas/hcaptcha/'.$version.'.js',
        ];
    }

    public function getCaptchaHandle(): string
    {
        return 'h-captcha-response';
    }

    protected function createClient(): ClientInterface
    {
        return \Craft::createGuzzleClient();
    }

    private function verifyToken(Form $form): CaptchaVerificationResult
    {
        return (new CaptchaVerifier($this->createClient()))->verify(
            'hcaptcha',
            (string) $this->getSiteKey(),
            (string) $this->getSecretKey(),
            (string) $this->getCaptchaResponse($form),
            \Craft::$app->request->getUserIP(),
        );
    }

    private function getCaptchaResponse(Form $form): ?string
    {
        if ($form->isGraphQLPosted()) {
            $arguments = $form->getGraphQLArguments();

            if (!isset($arguments['captcha'])) {
                return null;
            }

            $property = $arguments['captcha'];
            if (!\is_array($property) || !\is_string($property['value'] ?? null) || empty($property['value']) || 'h-captcha-response' !== ($property['name'] ?? null)) {
                return null;
            }

            return $property['value'];
        }

        if ($form->isHeadlessPosted()) {
            return HeadlessPayloadHelper::getCaptchaResponse($form, 'h-captcha-response');
        }

        $token = \Craft::$app->request->post('h-captcha-response');

        return \is_string($token) ? $token : null;
    }
}
