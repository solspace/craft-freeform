<?php

namespace Solspace\Freeform\Integrations\Captchas\FriendlyCaptcha;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Validators\Required;
use Solspace\Freeform\Attributes\Property\VisibilityFilter;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Integrations\Captchas\CaptchasBundle;
use Solspace\Freeform\Library\DataObjects\SpamReason;
use Solspace\Freeform\Library\Integrations\BaseIntegration;
use Solspace\Freeform\Library\Integrations\EnabledByDefault\EnabledByDefaultTrait;
use Solspace\Freeform\Library\Integrations\Types\Captchas\CaptchaIntegrationInterface;

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

    private const VERIFY_URL = 'https://global.frcapi.com/api/v2/captcha/siteverify';

    #[Required]
    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Flag(self::FLAG_ENV_SUGGEST)]
    #[Input\Text(
        label: 'Site Key',
        placeholder: 'FC…',
    )]
    private ?string $siteKey = null;

    #[Required]
    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Flag(self::FLAG_ENCRYPTED)]
    #[Flag(self::FLAG_ENV_SUGGEST)]
    #[Input\Text(
        label: 'API Key',
        instructions: 'Create an API key in the Friendly Captcha dashboard. Used as the X-API-Key header for server-side verification (not the site key).',
        placeholder: 'A1…',
    )]
    private ?string $apiKey = null;

    #[VisibilityFilter('Boolean(enabled)')]
    #[Input\BooleanEnv(
        label: 'Only load Captcha scripts once the user interacts with the form',
        instructions: "If you'd like to have the associated Captcha scripts load only once a user begins filling out the form, enable this setting. If you'd like your forms to be ready to go at page load, disable this setting.",
    )]
    private string $triggerOnInteract = 'false';

    #[VisibilityFilter('Boolean(enabled)')]
    #[Input\Select(
        label: 'Failure Behavior',
        options: [
            self::BEHAVIOR_DISPLAY_ERROR => 'Display Error Message',
            self::BEHAVIOR_SEND_TO_SPAM => 'Send to Spam Folder',
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
    #[Input\Select(
        label: 'Start Mode',
        instructions: 'When the widget begins solving: Auto (immediately), Focus (when the form is focused), or None (manual only).',
        options: [
            self::START_AUTO => 'Auto — activate immediately',
            self::START_FOCUS => 'Focus — activate on form focus',
            self::START_NONE => 'None — manual activation only',
        ],
    )]
    private string $startMode = self::START_FOCUS;

    #[VisibilityFilter('Boolean(enabled)')]
    #[Input\Select(
        label: 'Theme',
        options: [
            'auto' => 'Auto — match system preference',
            'light' => 'Light',
            'dark' => 'Dark',
        ],
    )]
    private string $theme = 'auto';

    #[VisibilityFilter('Boolean(enabled)')]
    #[Flag(self::FLAG_ENV_SUGGEST)]
    #[Input\Text(
        label: 'Language',
        instructions: 'Language code for the widget, e.g. `en`, `de`, `fr`. Leave blank for automatic detection.',
        placeholder: '',
    )]
    private string $locale = '';

    public function getSiteKey(): ?string
    {
        return $this->getProcessedValue($this->siteKey);
    }

    public function getApiKey(): ?string
    {
        return $this->getProcessedValue($this->apiKey);
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
        return strtolower($this->locale);
    }

    public function validate(Form $form): void
    {
        $formHandle = $form->getHandle();

        if (empty($this->getCaptchaResponse($form))) {
            $form->addError($this->getErrorMessage());

            $this->logger->debug('Friendly Captcha validation failed: token missing, widget may not have loaded', ['form' => $formHandle]);

            return;
        }

        $errors = $this->getValidationErrors($form);
        if (empty($errors)) {
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

    /**
     * @return string[]
     */
    private function getValidationErrors(Form $form): array
    {
        $apiKey = $this->getApiKey();
        $captchaResponse = $this->getCaptchaResponse($form);

        if (empty($apiKey)) {
            return ['The Friendly Captcha API key is not configured.'];
        }

        $client = new Client();

        try {
            $response = $client->post(self::VERIFY_URL, [
                'headers' => [
                    'X-API-Key' => $apiKey,
                    'Accept' => 'application/json',
                    'Content-Type' => 'application/json',
                ],
                'json' => array_filter([
                    'response' => $captchaResponse,
                    'sitekey' => $this->getSiteKey(),
                ]),
            ]);
        } catch (GuzzleException $exception) {
            $this->logger->error('Friendly Captcha siteverify request failed', [
                'form' => $form->getHandle(),
                'exception' => $exception->getMessage(),
            ]);

            return ['Unable to reach Friendly Captcha verification. Please try again.'];
        }

        $result = json_decode((string) $response->getBody(), true);
        if (!\is_array($result)) {
            return ['Invalid response from Friendly Captcha verification.'];
        }

        if (!empty($result['success'])) {
            $this->cacheRiskIntelligence($form, $result);

            return [];
        }

        return $this->mapVerificationErrors($result);
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

    /**
     * @return string[]
     */
    private function mapVerificationErrors(array $result): array
    {
        $errors = [];

        $error = $result['error'] ?? null;
        if (\is_array($error)) {
            $code = $error['error_code'] ?? null;
            $detail = $error['detail'] ?? null;

            if (\is_string($code)) {
                $errors[] = match ($code) {
                    'auth_required' => 'Friendly Captcha verification failed: API key was not sent.',
                    'auth_invalid' => 'Friendly Captcha verification failed: API key is invalid.',
                    'sitekey_invalid' => 'Friendly Captcha verification failed: site key is invalid.',
                    'response_missing' => 'The Friendly Captcha response token was not submitted.',
                    'response_invalid' => 'The Friendly Captcha response is invalid.',
                    'response_timeout' => 'The Friendly Captcha response has expired. Please try again.',
                    'response_duplicate' => 'The Friendly Captcha response was already used.',
                    'bad_request' => 'The Friendly Captcha verification request was invalid.',
                    default => 'Friendly Captcha verification failed'.(\is_string($detail) ? ': '.$detail : '.'),
                };
            }
        }

        if (empty($errors)) {
            $errors[] = 'Friendly Captcha verification failed.';
        }

        return $errors;
    }

    private function getCaptchaResponse(Form $form): ?string
    {
        if ($form->isGraphQLPosted()) {
            $arguments = $form->getGraphQLArguments();

            if (!isset($arguments['captcha'])) {
                return null;
            }

            $property = $arguments['captcha'];
            if (empty($property['name']) || empty($property['value']) || 'frc-captcha-response' !== $property['name']) {
                return null;
            }

            return $property['value'];
        }

        return \Craft::$app->request->post('frc-captcha-response');
    }
}
