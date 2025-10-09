<?php

namespace Solspace\Freeform\Integrations\SpamBlocking\AI;

use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Implementations\Integrations\IntegrationTransformer;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Section;
use Solspace\Freeform\Attributes\Property\Validators;
use Solspace\Freeform\Attributes\Property\ValueTransformer;
use Solspace\Freeform\Attributes\Property\VisibilityFilter;
use Solspace\Freeform\Bundles\Integrations\Providers\IntegrationClientProvider;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Integrations\AI\AiIntegrationInterface;
use Solspace\Freeform\Library\DataObjects\SpamReason;
use Solspace\Freeform\Library\Integrations\Types\SpamBlocking\SpamBlockingIntegration;

#[Type(
    name: 'AI Spam Analysis',
    type: Type::TYPE_SPAM_BLOCK,
    readme: __DIR__.'/README.md',
    iconPath: __DIR__.'/icon.svg',
)]
class AiSpamAnalysis extends SpamBlockingIntegration
{
    private const CONFIDENCE_LEVELS = [
        'DEFINITELY_SPAM',
        'LIKELY_SPAM',
        'POSSIBLY_SPAM',
        'NOT_SPAM',
        'SPAM_DETECTED',
        'SUSPICIOUS',
    ];

    private const DEFAULT_SYSTEM_PROMPT = 'Analyze the following form submission content and determine if it appears to be spam.';
    private const MAX_REASON_LENGTH = 140;
    #[Section('ai-spam')]
    #[VisibilityFilter('Boolean(enabled)')]
    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[Input\ApplicationStateSelect(
        label: 'AI Integration',
        instructions: 'Select an AI integration to analyze submissions for spam.',
        source: 'integrations',
        optionValue: 'uid',
        optionLabel: 'name',
        filters: [
            'Boolean(enabled)',
            'type === "ai"',
        ],
    )]
    #[Validators\Required]
    #[ValueTransformer(IntegrationTransformer::class)]
    protected ?AiIntegrationInterface $integration = null;

    #[Section('ai-spam')]
    #[VisibilityFilter('Boolean(enabled)')]
    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[Input\AiBox(
        label: 'Fields to Analyze',
        instructions: 'Select which fields to send for AI analysis. Use @ to include all fields.',
        availableFieldTypes: ['*'],
    )]
    protected string $fieldsToAnalyze = '@';

    #[Section('ai-spam')]
    #[VisibilityFilter('Boolean(enabled)')]
    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[Input\TextArea(
        label: 'System Prompt',
        instructions: 'Customize how the AI should analyze submissions for spam. Leave empty to use the default prompt.',
        placeholder: 'Analyze the content and provide a clear assessment of whether it appears to be spam or legitimate content.',
        rows: 3,
    )]
    protected string $systemPrompt = '';

    #[Section('ai-spam')]
    #[VisibilityFilter('Boolean(enabled)')]
    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[Input\Boolean(
        label: 'Include Field Labels',
        instructions: 'Send labels with values (e.g., "Name: John Doe").',
    )]
    protected bool $includeFieldLabels = true;

    #[Section('ai-spam')]
    #[VisibilityFilter('Boolean(enabled)')]
    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[Input\Boolean(
        label: 'Display Errors',
        instructions: 'When enabled, a detailed error will be displayed to the user instead of silently marking the submission as spam.',
    )]
    protected bool $displayErrors = false;

    public static function isInstallable(): bool
    {
        return true;
    }

    public function validate(Form $form, bool $displayErrors): void
    {
        if (!$this->isValidIntegration()) {
            return;
        }

        if (!$this->isEnabled()) {
            return;
        }

        $content = $this->prepareContentForAnalysis($form);
        if (empty(trim($content))) {
            return;
        }

        $response = $this->processAiRequest($form, $content);
        if (empty($response)) {
            return;
        }

        if ($this->isSpamResponse($response)) {
            $this->handleSpamDetection($form, $response, $displayErrors);
        }
    }

    private function isValidIntegration(): bool
    {
        return $this->integration instanceof AiIntegrationInterface;
    }

    private function processAiRequest(Form $form, string $content): ?string
    {
        $systemPrompt = $this->buildSystemPrompt();
        $options = [
            'model' => $this->integration->getModel(),
            'max_tokens' => $this->integration->getMaxTokens(),
        ];

        $clientProvider = \Craft::$container->get(IntegrationClientProvider::class);
        $client = $clientProvider->getAuthorizedClient($this->integration);

        try {
            return $this->integration->processAiRequest($client, $systemPrompt, $content, $options);
        } catch (\Throwable $e) {
            Freeform::getInstance()->logger->getLogger('ai')->error(
                'AI Spam Analysis failed: '.$e->getMessage(),
                [
                    'form' => $form->getHandle(),
                    'exception' => $e,
                ]
            );

            return null;
        }
    }

    private function handleSpamDetection(Form $form, string $response, bool $displayErrors): void
    {
        $reason = $this->getSpamReason($response);
        $confidence = $this->getSpamConfidence($response);
        $message = $reason ?: $this->formatConfidenceMessage($confidence);

        if ($this->displayErrors || $displayErrors) {
            $form->addError(Freeform::t('Submission flagged as spam by AI: {reason}', ['reason' => $message]));
        } else {
            $spamReason = $this->buildSpamReason($message, $confidence, $response);
            $form->markAsSpam(SpamReason::TYPE_AI, $spamReason);
        }
    }

    private function formatConfidenceMessage(string $confidence): string
    {
        return ucfirst(strtolower(str_replace('_', ' ', $confidence)));
    }

    private function buildSpamReason(string $message, string $confidence, string $response): string
    {
        $spamReason = 'AI Spam Analysis: '.$message;
        $details = [];

        if ($confidence && 'UNKNOWN' !== $confidence) {
            $details[] = 'Confidence: '.$this->formatConfidenceMessage($confidence);
        }

        $rating = $this->getSpamRating($response);
        if ($rating) {
            $details[] = 'Rating: '.$rating.'/10';
        }

        if (!empty($details)) {
            $spamReason .= ' ('.implode(', ', $details).')';
        }

        return $spamReason;
    }

    private function prepareContentForAnalysis(Form $form): string
    {
        $handles = $this->getFieldsToProcess($form);
        $content = [];

        foreach ($handles as $handle) {
            $field = $form->get($handle);
            if (!$field) {
                continue;
            }

            $value = $field->getValue();
            if (null === $value || '' === $value || (\is_array($value) && 0 === \count($value))) {
                continue;
            }

            if (\is_array($value)) {
                $value = implode(', ', array_map('strval', $value));
            }

            if ($this->includeFieldLabels) {
                $label = $field->getLabel() ?: $field->getHandle();
                $content[] = $label.': '.$value;
            } else {
                $content[] = (string) $value;
            }
        }

        return implode("\n\n", $content);
    }

    private function getFieldsToProcess(Form $form): array
    {
        $raw = trim((string) $this->fieldsToAnalyze);

        if (\in_array($raw, ['', '@', '@all'], true)) {
            return $this->getAllFieldHandles($form);
        }

        $handles = $this->extractFieldHandles($raw);

        return !empty($handles) ? $handles : $this->getAllFieldHandles($form);
    }

    private function getAllFieldHandles(Form $form): array
    {
        $handles = [];
        foreach ($form->getLayout()->getFields() as $field) {
            $handle = $field->getHandle();
            if ($handle) {
                $handles[] = $handle;
            }
        }

        return $handles;
    }

    private function extractFieldHandles(string $raw): array
    {
        if (preg_match_all('/field:([a-zA-Z0-9_]+)/', $raw, $matches)) {
            return $matches[1];
        }

        $bySpace = array_filter(array_map('trim', explode(' ', $raw)));
        if (!empty($bySpace)) {
            return $bySpace;
        }

        return array_filter(array_map('trim', explode("\n", $raw)));
    }

    private function isSpamResponse(?string $response): bool
    {
        if (empty($response)) {
            return false;
        }

        $isSpam = $this->extractJsonValue($response, 'isSpam');
        if (null !== $isSpam) {
            return (bool) $isSpam;
        }

        $normalized = strtoupper(trim($response));

        return $this->checkSpamIndicators($normalized);
    }

    private function getSpamConfidence(?string $response): string
    {
        if (empty($response)) {
            return 'UNKNOWN';
        }

        $confidence = $this->extractJsonValue($response, 'confidence');
        if (null !== $confidence) {
            return $this->normalizeConfidence(strtoupper(trim($confidence)));
        }

        $normalized = strtoupper(trim($response));

        return $this->normalizeConfidence($normalized);
    }

    private function checkSpamIndicators(string $normalized): bool
    {
        $notSpamIndicators = $this->getNotSpamKeywords();
        $spamIndicators = $this->getSpamKeywords();

        if (\in_array($normalized, $notSpamIndicators, true)) {
            return false;
        }

        if (\in_array($normalized, $spamIndicators, true)) {
            return true;
        }

        foreach ($notSpamIndicators as $indicator) {
            if (str_contains($normalized, $indicator)) {
                return false;
            }
        }

        foreach ($spamIndicators as $indicator) {
            if (str_contains($normalized, $indicator)) {
                return true;
            }
        }

        return false;
    }

    private function normalizeConfidence(string $confidence): string
    {
        if (\in_array($confidence, self::CONFIDENCE_LEVELS, true)) {
            return $confidence;
        }

        foreach (self::CONFIDENCE_LEVELS as $validConfidence) {
            if (str_contains($confidence, $validConfidence)) {
                return $validConfidence;
            }
        }

        if (str_contains($confidence, 'FLAGGED_AS_SPAM')) {
            return 'SPAM_DETECTED';
        }

        return 'UNKNOWN';
    }

    private function getSpamReason(?string $response): ?string
    {
        if (empty($response)) {
            return null;
        }

        $reason = $this->extractJsonValue($response, 'reason');

        return $reason ? trim($reason) : null;
    }

    private function getSpamRating(?string $response): ?int
    {
        if (empty($response)) {
            return null;
        }

        $rating = $this->extractJsonValue($response, 'spam_rating');

        return $rating ? (int) $rating : null;
    }

    private function extractJsonValue(string $response, string $key): mixed
    {
        $jsonData = json_decode($response, true);
        if (\JSON_ERROR_NONE === json_last_error() && isset($jsonData[$key])) {
            return $jsonData[$key];
        }

        $pattern = '/\{[^}]*"'.$key.'"[^}]*\}/';
        if (preg_match($pattern, $response, $matches)) {
            $jsonData = json_decode($matches[0], true);
            if (\JSON_ERROR_NONE === json_last_error() && isset($jsonData[$key])) {
                return $jsonData[$key];
            }
        }

        return null;
    }

    private function buildSystemPrompt(): string
    {
        $userPrompt = trim($this->systemPrompt) ?: self::DEFAULT_SYSTEM_PROMPT;
        $spamKeywords = $this->getSpamKeywords();
        $notSpamKeywords = $this->getNotSpamKeywords();

        return $userPrompt.'

        Respond with JSON format:
        {
            "confidence": "DEFINITELY_SPAM|LIKELY_SPAM|POSSIBLY_SPAM|NOT_SPAM",
            "spam_rating": 1-10,
            "isSpam": true/false,
            "reason": "A short, human-readable sentence (<= '.self::MAX_REASON_LENGTH.' chars) explaining why it is spam or legitimate. Do NOT include the SPAM/NOT_SPAM keywords below or any ALL_CAPS words."
        }

        Use these specific keywords ONLY for the "confidence" field (do not repeat them in "reason"):
        SPAM: '.implode(', ', $spamKeywords).'
        NOT_SPAM: '.implode(', ', $notSpamKeywords).'

        Output only the JSON object and nothing else.';
    }

    private function getSpamKeywords(): array
    {
        return [
            'DEFINITELY_SPAM',
            'LIKELY_SPAM',
            'IS_SPAM',
            'CONTAINS_SPAM',
            'APPEARS_TO_BE_SPAM',
            'SUSPICIOUS',
            'PROMOTIONAL',
            'INAPPROPRIATE',
            'SPAM_DETECTED',
            'FLAGGED_AS_SPAM',
        ];
    }

    private function getNotSpamKeywords(): array
    {
        return [
            'NOT_SPAM',
            'NOT_APPEAR_TO_BE_SPAM',
            'DOES_NOT_APPEAR_TO_BE_SPAM',
            'IS_NOT_SPAM',
            'NOT_SUSPICIOUS',
            'LEGITIMATE',
            'CLEAN',
            'VALID',
            'APPROVED',
            'LEGITIMATE_REQUEST',
            'STRAIGHTFORWARD_REQUEST',
        ];
    }
}
