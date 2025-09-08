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
class AiSpamProtection extends SpamBlockingIntegration
{
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
        instructions: 'When enabled, a general error will be displayed to the user instead of silently marking the submission as spam.',
    )]
    protected bool $displayErrors = false;

    public static function isInstallable(): bool
    {
        // Always installable; fields will guide the user to select an AI integration
        return true;
    }

    public function validate(Form $form, bool $displayErrors): void
    {
        if (!$this->integration || !$this->integration instanceof AiIntegrationInterface) {
            return;
        }

        if (!$this->isEnabled()) {
            return;
        }

        // Build content from selected fields
        $content = $this->prepareContentForAnalysis($form);
        if ('' === trim($content)) {
            return;
        }

        $systemPrompt = $this->buildSystemPrompt();
        $options = [
            'model' => $this->integration->getModel(),
            'max_tokens' => $this->integration->getMaxTokens(),
        ];

        try {
            $response = $this->integration->processAiRequest($systemPrompt, $content, $options);
        } catch (\Throwable $e) {
            Freeform::getInstance()->logger->getLogger('ai')->error(
                'AI Spam Analysis failed: '.$e->getMessage(),
                [
                    'form' => $form->getHandle(),
                    'exception' => $e,
                ]
            );

            return;
        }

        if ($this->isSpamResponse($response)) {
            $reason = $this->getSpamReason($response);
            $confidence = $this->getSpamConfidence($response);
            $message = $reason ?: ucfirst(strtolower(str_replace('_', ' ', $confidence)));

            if ($this->displayErrors || $displayErrors) {
                $form->addError(Freeform::t('Submission flagged as spam by AI: {reason}', ['reason' => $message]));
            } else {
                $spamReason = 'AI Spam Analysis: '.$message;

                $details = [];
                if ($confidence && 'UNKNOWN' !== $confidence) {
                    $details[] = 'Confidence: '.ucfirst(strtolower(str_replace('_', ' ', $confidence)));
                }

                $rating = $this->getSpamRating($response);
                if ($rating) {
                    $details[] = 'Rating: '.$rating.'/10';
                }

                if (!empty($details)) {
                    $spamReason .= ' ('.implode(', ', $details).')';
                }

                $form->markAsSpam(SpamReason::TYPE_AI, $spamReason);
            }
        }
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

        if ('' === $raw || '@' === $raw || '@all' === $raw) {
            $handles = [];
            foreach ($form->getLayout()->getFields() as $field) {
                $handle = $field->getHandle();
                if ($handle) {
                    $handles[] = $handle;
                }
            }

            return $handles;
        }

        preg_match_all('/field:([a-zA-Z0-9_]+)/', $raw, $matches);
        if (!empty($matches[1])) {
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
        if (!$response) {
            return false;
        }

        $jsonData = json_decode($response, true);
        if (\JSON_ERROR_NONE === json_last_error() && isset($jsonData['isSpam'])) {
            return (bool) $jsonData['isSpam'];
        }

        if (preg_match('/\{[^}]*"isSpam"[^}]*\}/', $response, $matches)) {
            $jsonData = json_decode($matches[0], true);
            if (\JSON_ERROR_NONE === json_last_error() && isset($jsonData['isSpam'])) {
                return (bool) $jsonData['isSpam'];
            }
        }

        $normalized = strtoupper(trim($response));
        $notSpamIndicators = $this->getNotSpamKeywords();

        foreach ($notSpamIndicators as $indicator) {
            if (str_contains($normalized, $indicator)) {
                return false;
            }
        }

        $spamIndicators = $this->getSpamKeywords();
        foreach ($spamIndicators as $indicator) {
            if (str_contains($normalized, $indicator)) {
                return true;
            }
        }

        return false;
    }

    private function getSpamConfidence(?string $response): string
    {
        if (!$response) {
            return 'UNKNOWN';
        }

        $jsonData = json_decode($response, true);
        if (\JSON_ERROR_NONE === json_last_error() && isset($jsonData['confidence'])) {
            return strtoupper(trim($jsonData['confidence']));
        }

        if (preg_match('/\{[^}]*"confidence"[^}]*\}/', $response, $matches)) {
            $jsonData = json_decode($matches[0], true);
            if (\JSON_ERROR_NONE === json_last_error() && isset($jsonData['confidence'])) {
                return strtoupper(trim($jsonData['confidence']));
            }
        }

        $normalized = strtoupper(trim($response));

        if (str_contains($normalized, 'DEFINITELY_SPAM')) {
            return 'DEFINITELY_SPAM';
        }
        if (str_contains($normalized, 'LIKELY_SPAM')) {
            return 'LIKELY_SPAM';
        }
        if (str_contains($normalized, 'POSSIBLY_SPAM')) {
            return 'POSSIBLY_SPAM';
        }

        if (str_contains($normalized, 'NOT_SPAM')
            || str_contains($normalized, 'NOT APPEAR TO BE SPAM')
            || str_contains($normalized, 'DOES NOT APPEAR TO BE SPAM')
            || str_contains($normalized, 'IS NOT SPAM')
            || str_contains($normalized, 'LEGITIMATE')
            || str_contains($normalized, 'STRAIGHTFORWARD REQUEST')
        ) {
            return 'NOT_SPAM';
        }

        if (str_contains($normalized, 'SPAM DETECTED') || str_contains($normalized, 'FLAGGED AS SPAM')) {
            return 'SPAM_DETECTED';
        }
        if (str_contains($normalized, 'SUSPICIOUS')) {
            return 'SUSPICIOUS';
        }

        return 'UNKNOWN';
    }

    private function getSpamReason(?string $response): ?string
    {
        if (!$response) {
            return null;
        }

        $jsonData = json_decode($response, true);
        if (\JSON_ERROR_NONE === json_last_error() && isset($jsonData['reason'])) {
            return trim($jsonData['reason']);
        }

        if (preg_match('/\{[^}]*"reason"[^}]*\}/', $response, $matches)) {
            $jsonData = json_decode($matches[0], true);
            if (\JSON_ERROR_NONE === json_last_error() && isset($jsonData['reason'])) {
                return trim($jsonData['reason']);
            }
        }

        return null;
    }

    private function getSpamRating(?string $response): ?int
    {
        if (!$response) {
            return null;
        }

        $jsonData = json_decode($response, true);
        if (\JSON_ERROR_NONE === json_last_error() && isset($jsonData['spam_rating'])) {
            return (int) $jsonData['spam_rating'];
        }

        if (preg_match('/\{[^}]*"spam_rating"[^}]*\}/', $response, $matches)) {
            $jsonData = json_decode($matches[0], true);
            if (\JSON_ERROR_NONE === json_last_error() && isset($jsonData['spam_rating'])) {
                return (int) $jsonData['spam_rating'];
            }
        }

        return null;
    }

    private function buildSystemPrompt(): string
    {
        $userPrompt = trim($this->systemPrompt) ?: 'Analyze the following form submission content and determine if it appears to be spam.';
        $spamKeywords = $this->getSpamKeywords();
        $notSpamKeywords = $this->getNotSpamKeywords();

        return $userPrompt.'

        Respond with JSON format:
        {
            "confidence": "DEFINITELY_SPAM|LIKELY_SPAM|POSSIBLY_SPAM|NOT_SPAM",
            "spam_rating": 1-10,
            "isSpam": true/false,
            "reason": "A short, human-readable sentence (<= 140 chars) explaining why it is spam or legitimate. Do NOT include the SPAM/NOT_SPAM keywords below or any ALL_CAPS words."
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
