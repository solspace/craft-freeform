<?php

namespace Solspace\Freeform\Integrations\Captchas\Turnstile;

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
use Solspace\Freeform\Integrations\Captchas\CaptchaVerificationResult;
use Solspace\Freeform\Integrations\Captchas\CaptchaVerifier;
use Solspace\Freeform\Library\DataObjects\SpamReason;
use Solspace\Freeform\Library\Integrations\BaseIntegration;
use Solspace\Freeform\Library\Integrations\EnabledByDefault\EnabledByDefaultTrait;
use Solspace\Freeform\Library\Integrations\Types\Captchas\CaptchaIntegrationInterface;
use Solspace\Freeform\Services\Headless\HeadlessPayloadHelper;

#[Type(
    name: 'Turnstile',
    type: Type::TYPE_CAPTCHAS,
    readme: __DIR__.'/README.md',
    iconPath: __DIR__.'/icon.svg',
)]
class Turnstile extends BaseIntegration implements CaptchaIntegrationInterface
{
    use EnabledByDefaultTrait;

    public const BEHAVIOR_DISPLAY_ERROR = 'display-error';
    public const BEHAVIOR_SEND_TO_SPAM = 'send-to-spam';

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
    #[VisibilityFilter('values.failureBehavior === "display-error"')]
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
    #[Input\ButtonGroup(
        label: 'Widget theme',
        instructions: 'Auto follows the visitor’s light or dark appearance preference.',
        order: 100,
        options: [
            'auto' => 'Auto',
            'light' => 'Light',
            'dark' => 'Dark',
        ],
    )]
    private string $theme = 'auto';

    #[VisibilityFilter('Boolean(values.showAdvanced)')]
    #[VisibilityFilter('Boolean(enabled)')]
    #[Input\ButtonGroup(
        label: 'Widget size',
        instructions: 'Normal is 300 × 65 px. Flexible fills the available width, with a 300 px minimum. Compact is 150 × 140 px. Invisible widgets ignore this setting.',
        order: 101,
        options: [
            'normal' => 'Normal',
            'flexible' => 'Flexible',
            'compact' => 'Compact',
        ],
    )]
    private string $size = 'normal';

    #[VisibilityFilter('Boolean(values.showAdvanced)')]
    #[VisibilityFilter('Boolean(enabled)')]
    #[Flag(self::FLAG_ENV_SUGGEST)]
    #[Middleware('regex', ['pattern' => '[^a-zA-Z0-9_]'])]
    #[Input\Text(
        label: 'Turnstile action name',
        instructions: 'Use `submit` for most forms. This name identifies submissions in Cloudflare analytics.',
        order: 104,
        placeholder: 'submit',
    )]
    private string $action = 'submit';

    #[VisibilityFilter('Boolean(values.showAdvanced)')]
    #[VisibilityFilter('Boolean(enabled)')]
    #[Flag(self::FLAG_ENV_SUGGEST)]
    #[Input\Text(
        label: 'Turnstile language',
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

    public function getFailureBehavior(): string
    {
        return $this->failureBehavior;
    }

    public function getErrorMessage(): string
    {
        return $this->errorMessage ?: 'Please verify that you are not a robot.';
    }

    public function getTheme(): string
    {
        return $this->theme;
    }

    public function getSize(): string
    {
        return $this->size;
    }

    public function getAction(): string
    {
        return trim((string) $this->getProcessedValue($this->action)) ?: 'submit';
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

        // If no token was submitted, Turnstile Captcha never loaded on the client side. Always show an error so the user knows their submission did not go through, regardless of the configured failure behavior.
        $formHandle = $form->getHandle();

        if (empty($this->getCaptchaResponse($form))) {
            $form->addError($this->getErrorMessage());

            $this->logger->debug('Turnstile Captcha validation failed: token missing, Turnstile may not have loaded', ['form' => $formHandle]);

            return;
        }

        $result = $this->verifyToken($form);
        if ($result->serviceError) {
            $form->addError($this->getErrorMessage());
            $this->logger->error('Turnstile verification unavailable', ['form' => $formHandle, 'errors' => $result->errors]);

            return;
        }
        $errors = $result->errors;
        if (empty($errors)) {
            $this->logger->debug('Turnstile Captcha validation passed', ['form' => $formHandle]);

            return;
        }

        $this->logger->debug('Turnstile Captcha validation failed', ['form' => $formHandle, 'errors' => $errors]);

        $behavior = $this->getFailureBehavior();
        if (self::BEHAVIOR_DISPLAY_ERROR === $behavior) {
            $form->addError($this->getErrorMessage());
        } elseif (self::BEHAVIOR_SEND_TO_SPAM === $behavior) {
            $form->markAsSpam(SpamReason::TYPE_CAPTCHA, 'Turnstile ['.$formHandle.'] - '.implode(', ', $errors));
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
            ->replace('data-freeform-turnstile-container')
            ->replace('data-captcha', 'turnstile')
            ->setIfEmpty('data-sitekey', $this->getSiteKey())
            ->setIfEmpty('data-theme', $this->getTheme())
            ->setIfEmpty('data-size', $this->getSize())
            ->setIfEmpty('data-lazy-load', $this->isTriggerOnInteract())
            ->setIfEmpty('data-action', $this->getAction())
            ->setIfEmpty('data-language', $locale)
        ;

        return '<div'.$attributes.'></div>';
    }

    public function getScriptPaths(): array
    {
        return ['js/scripts/front-end/captchas/turnstile/v0.js'];
    }

    public function getCaptchaHandle(): string
    {
        return 'cf-turnstile-response';
    }

    protected function createClient(): ClientInterface
    {
        return \Craft::createGuzzleClient();
    }

    private function verifyToken(Form $form): CaptchaVerificationResult
    {
        return (new CaptchaVerifier($this->createClient()))->verify(
            'turnstile',
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
            if (!\is_array($property) || !\is_string($property['value'] ?? null) || empty($property['value']) || 'cf-turnstile-response' !== ($property['name'] ?? null)) {
                return null;
            }

            return $property['value'];
        }

        if ($form->isHeadlessPosted()) {
            return HeadlessPayloadHelper::getCaptchaResponse($form, 'cf-turnstile-response');
        }

        $token = \Craft::$app->request->post('cf-turnstile-response');

        return \is_string($token) ? $token : null;
    }
}
