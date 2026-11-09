<?php

namespace Solspace\Freeform\Integrations\Captchas\FriendlyCaptcha;

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
    name: 'Friendly Captcha',
    type: Type::TYPE_CAPTCHAS,
    readme: __DIR__.'/README.md',
    iconPath: __DIR__.'/icon.svg',
)]
class FriendlyCaptcha extends BaseIntegration implements CaptchaIntegrationInterface
{
    use EnabledByDefaultTrait;

    public const PROPERTY_RISK_CACHE = 'friendlyCaptchaRiskIntelligence';

    public const BEHAVIOR_DISPLAY_ERROR = 'display-error';
    public const BEHAVIOR_SEND_TO_SPAM = 'send-to-spam';

    public const START_AUTO = 'auto';
    public const START_FOCUS = 'focus';
    public const START_NONE = 'none';

    #[Required]
    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Flag(self::FLAG_ENV_SUGGEST)]
    #[Input\Text(
        label: 'Site Key',
        order: 10,
        instructions: 'Copy the site key from the provider’s dashboard.',
        placeholder: 'FC…',
    )]
    private ?string $siteKey = null;

    #[Required]
    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Flag(self::FLAG_ENCRYPTED)]
    #[Flag(self::FLAG_ENV_SUGGEST)]
    #[Input\Text(
        label: 'API Key',
        order: 11,
        instructions: 'Copy the API key from the Friendly Captcha dashboard. This stays on your server.',
        placeholder: 'A1…',
    )]
    private ?string $apiKey = null;

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

    #[VisibilityFilter('Boolean(enabled)')]
    #[Input\ButtonGroup(
        label: 'When to start verification',
        order: 1,
        instructions: 'Choose when the verification starts. This is separate from loading the widget.',
        options: [
            self::START_FOCUS => 'On form focus',
            self::START_AUTO => 'When widget loads',
            self::START_NONE => 'On request',
        ],
    )]
    private string $startMode = self::START_FOCUS;

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
    #[Flag(self::FLAG_ENV_SUGGEST)]
    #[Input\Text(
        label: 'Friendly Captcha language',
        instructions: 'Leave blank for automatic selection. To choose a language, enter a code such as `en`, `fr`, or `de`.',
        placeholder: 'Automatic',
        order: 105,
    )]
    private string $locale = '';

    public function getSiteKey(): ?string
    {
        return trim((string) $this->getProcessedValue($this->siteKey)) ?: null;
    }

    public function getApiKey(): ?string
    {
        return trim((string) $this->getProcessedValue($this->apiKey)) ?: null;
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
        return 'normal';
    }

    public function getStartMode(): string
    {
        return $this->startMode;
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

        $formHandle = $form->getHandle();

        $token = $this->getCaptchaResponse($form);
        if (empty($token) || str_starts_with($token, '.')) {
            $form->addError($this->getErrorMessage());

            $this->logger->debug('Friendly Captcha validation failed: token missing, widget may not have loaded', ['form' => $formHandle]);

            return;
        }

        $result = $this->verifyToken($form);
        if ($result->serviceError) {
            $form->addError($this->getErrorMessage());
            $this->logger->error('Friendly Captcha verification unavailable', ['form' => $formHandle, 'errors' => $result->errors]);

            return;
        }
        $errors = $result->errors;
        if (empty($errors)) {
            $this->cacheRiskIntelligence($form, $result->data);
            $this->logger->debug('Friendly Captcha validation passed', ['form' => $formHandle]);

            return;
        }

        $this->logger->debug('Friendly Captcha validation failed', ['form' => $formHandle, 'errors' => $errors]);

        $behavior = $this->getFailureBehavior();
        if (self::BEHAVIOR_DISPLAY_ERROR === $behavior) {
            $form->addError($this->getErrorMessage());
        } elseif (self::BEHAVIOR_SEND_TO_SPAM === $behavior) {
            $form->markAsSpam(SpamReason::TYPE_CAPTCHA, 'Friendly Captcha ['.$formHandle.'] - '.implode(', ', $errors));
        }
    }

    public function getHtmlTag(Form $form): string
    {
        $attributes = CaptchasBundle::getCaptchaAttributes($form);
        $attributes
            ->replace('data-freeform-friendly-captcha-container')
            ->replace('data-captcha', 'friendly-captcha')
            ->setIfEmpty('data-sitekey', $this->getSiteKey())
            ->setIfEmpty('data-start', $this->getStartMode())
            ->setIfEmpty('data-theme', $this->getTheme())
            ->setIfEmpty('data-api-endpoint', 'global')
            ->setIfEmpty('data-lazy-load', $this->isTriggerOnInteract())
        ;

        $locale = $this->getLocale();
        if ('' !== $locale) {
            $attributes->setIfEmpty('data-language', $locale);
        }

        return '<div'.$attributes.'></div>';
    }

    public function getScriptPaths(): array
    {
        return ['js/scripts/front-end/captchas/friendly-captcha/v2.js'];
    }

    public function getCaptchaHandle(): string
    {
        return 'frc-captcha-response';
    }

    /**
     * @param array<string, int> $scores
     */
    public static function formatRiskScores(array $scores): string
    {
        $parts = [];
        $labels = [
            'overall' => 'Overall',
            'network' => 'Network',
            'browser' => 'Browser',
        ];

        foreach ($labels as $key => $label) {
            if (isset($scores[$key]) && is_numeric($scores[$key])) {
                $parts[] = \sprintf('%s %d/5', $label, (int) $scores[$key]);
            }
        }

        foreach ($scores as $key => $value) {
            if (isset($labels[$key]) || !is_numeric($value)) {
                continue;
            }
            $parts[] = \sprintf('%s %d/5', (string) $key, (int) $value);
        }

        return implode(', ', $parts);
    }

    protected function createClient(): ClientInterface
    {
        return \Craft::createGuzzleClient();
    }

    private function verifyToken(Form $form): CaptchaVerificationResult
    {
        return (new CaptchaVerifier($this->createClient()))->verify(
            'friendly-captcha',
            (string) $this->getSiteKey(),
            (string) $this->getApiKey(),
            (string) $this->getCaptchaResponse($form),
            \Craft::$app->request->getUserIP(),
        );
    }

    private function cacheRiskIntelligence(Form $form, array $result): void
    {
        $riskIntelligence = $result['data']['risk_intelligence'] ?? null;
        if (!\is_array($riskIntelligence)) {
            return;
        }

        $scores = $riskIntelligence['risk_scores'] ?? null;
        if (!\is_array($scores) || [] === $scores) {
            return;
        }

        $formatted = self::formatRiskScores($scores);
        if ('' === $formatted) {
            return;
        }

        $form->getProperties()->set(self::PROPERTY_RISK_CACHE, $formatted);
    }

    private function getCaptchaResponse(Form $form): ?string
    {
        if ($form->isGraphQLPosted()) {
            $arguments = $form->getGraphQLArguments();

            if (!isset($arguments['captcha'])) {
                return null;
            }

            $property = $arguments['captcha'];
            if (!\is_array($property) || !\is_string($property['value'] ?? null) || empty($property['value']) || 'frc-captcha-response' !== ($property['name'] ?? null)) {
                return null;
            }

            return $property['value'];
        }

        if ($form->isHeadlessPosted()) {
            return HeadlessPayloadHelper::getCaptchaResponse($form, 'frc-captcha-response');
        }

        $token = \Craft::$app->request->post('frc-captcha-response');

        return \is_string($token) ? $token : null;
    }
}
