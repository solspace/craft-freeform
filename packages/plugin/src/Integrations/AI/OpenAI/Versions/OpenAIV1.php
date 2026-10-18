<?php

namespace Solspace\Freeform\Integrations\AI\OpenAI\Versions;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use GuzzleHttp\Exception\RequestException;
use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Attributes\Property\Edition;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Integrations\AI\OpenAI\BaseOpenAIIntegration;
use Solspace\Freeform\Integrations\AI\ReferenceAiIntegrationInterface;
use Solspace\Freeform\Library\AI\FormGenerationException;
use Solspace\Freeform\Library\AI\FormGenerationResponse;
use Solspace\Freeform\Library\AI\PendingFormGeneration;
use Solspace\Freeform\Library\AI\ReferenceFile;
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;

#[Edition(Edition::PRO)]
#[Type(
    name: 'OpenAI',
    type: Type::TYPE_AI,
    version: 'v1',
    readme: __DIR__.'/../README.md',
    iconPath: __DIR__.'/../icon.svg',
)]
class OpenAIV1 extends BaseOpenAIIntegration implements ReferenceAiIntegrationInterface
{
    public function getReferenceMimeTypes(): array
    {
        $model = $this->getModel();
        if (preg_match('/audio|realtime|tts|embedding|image|search/i', $model)) {
            return [];
        }

        return preg_match('/^(?:ft:)?(?:gpt-(?:4o|4\.1|[5-9])|chatgpt-4o|o[134](?!-(?:mini|preview|pro|deep-research)))/i', $model) ? ReferenceFile::MIME_TYPES : [];
    }

    public function supportsBackgroundGeneration(): bool
    {
        return (bool) preg_match('/^(?:ft:)?(?:gpt-(?:4o|4\.1|[5-9])|o[134](?:-|$))/i', $this->getModel())
            && !preg_match('/audio|realtime|tts|embedding|image|search|chat/i', $this->getModel());
    }

    public function getApiRootUrl(): string
    {
        return 'https://api.openai.com/v1';
    }

    public function checkConnection(Client $client): bool
    {
        $response = $client->get($this->getEndpoint('/models'));

        return 200 === $response->getStatusCode();
    }

    public function fetchFields(string $category): array
    {
        return match ($category) {
            self::CATEGORY_AI => [
                new FieldObject('system_prompt', 'System Prompt', FieldObject::TYPE_STRING, $category, true),
                new FieldObject('user_content', 'User Content', FieldObject::TYPE_STRING, $category, true),
            ],
            default => [],
        };
    }

    public function processAiRequest(
        Client $client,
        string $systemPrompt,
        string $userContent,
        array $options = []
    ): string {
        if (!empty($options['background'])) {
            return $this->processBackgroundRequest($client, $systemPrompt, $userContent, $options);
        }
        $content = $userContent;
        if (!empty($options['referenceFiles'])) {
            $content = [['type' => 'text', 'text' => $userContent]];
            foreach ($options['referenceFiles'] as $file) {
                $content[] = 'application/pdf' === $file->mimeType
                    ? ['type' => 'file', 'file' => ['filename' => $file->name, 'file_data' => $file->getDataUrl()]]
                    : ['type' => 'image_url', 'image_url' => ['url' => $file->getDataUrl(), 'detail' => 'high']];
            }
        }
        $payload = [
            'model' => $options['model'] ?? $this->getModel(),
            'max_completion_tokens' => $options['max_tokens'] ?? $this->getMaxTokens(),
            'messages' => [
                [
                    'role' => 'system',
                    'content' => $systemPrompt,
                ],
                [
                    'role' => 'user',
                    'content' => $content,
                ],
            ],
        ];

        $effort = $this->reasoningEffortFor($payload['model'], $options);
        if (null !== $effort) {
            $payload['reasoning_effort'] = $effort;
        }

        $response = $client->post(
            $this->getEndpoint('/chat/completions'),
            ['json' => $payload, 'timeout' => $options['timeout'] ?? 120]
        );

        $data = json_decode((string) $response->getBody(), true);
        FormGenerationResponse::requireComplete($data['choices'][0]['finish_reason'] ?? null, $options);

        return $data['choices'][0]['message']['content'] ?? '';
    }

    private function reasoningEffortFor(string $model, array $options): ?string
    {
        $effort = $options['reasoning_effort'] ?? $this->getReasoningEffort();
        if (null === $effort) {
            return null;
        }
        if (!\in_array($effort, ['low', 'medium', 'high', 'xhigh', 'max'], true)
            || !preg_match('/^(?:ft:)?(?:gpt-[5-9](?:[.-]|$)|o[134](?:-|$))/i', $model)
            || preg_match('/(?:^|[-_])(?:chat|codex|realtime|audio|search|image)(?:[-_]|$)/i', $model)
        ) {
            throw new FormGenerationException(Freeform::t('The selected model does not support this reasoning setting. Choose Model default or a supported reasoning level in the OpenAI integration.'));
        }

        return $effort;
    }

    private function processBackgroundRequest(Client $client, string $systemPrompt, string $userContent, array $options): string
    {
        $responseId = $options['response_id'] ?? null;
        $requestOptions = ['timeout' => null === $responseId ? 20 : 10, 'connect_timeout' => 5];
        if (null !== $responseId && !preg_match('/^resp_[a-zA-Z0-9_-]{1,200}$/D', $responseId)) {
            throw new FormGenerationException(Freeform::t('The saved OpenAI generation could not be resumed. Check the Forms list before starting another request.'));
        }

        try {
            if (null !== $responseId) {
                $response = $client->get($this->getEndpoint('/responses/'.$responseId), $requestOptions);
            } else {
                $content = [['type' => 'input_text', 'text' => $userContent]];
                foreach ($options['referenceFiles'] ?? [] as $file) {
                    $content[] = 'application/pdf' === $file->mimeType
                        ? ['type' => 'input_file', 'filename' => $file->name, 'file_data' => $file->getDataUrl()]
                        : ['type' => 'input_image', 'image_url' => $file->getDataUrl(), 'detail' => 'high'];
                }
                $model = $options['model'] ?? $this->getModel();
                $payload = [
                    'model' => $model,
                    'background' => true,
                    // Retain the result so closing the dialog does not lose it
                    // after OpenAI's short default background polling window.
                    'store' => true,
                    'max_output_tokens' => $options['max_tokens'] ?? $this->getMaxTokens(),
                    'instructions' => $systemPrompt,
                    'input' => [['role' => 'user', 'content' => $content]],
                ];
                $effort = $this->reasoningEffortFor($model, $options);
                if (null !== $effort) {
                    $payload['reasoning'] = ['effort' => $effort];
                }
                $response = $client->post($this->getEndpoint('/responses'), $requestOptions + ['json' => $payload]);
            }
        } catch (GuzzleException $exception) {
            $status = $exception instanceof RequestException ? $exception->getResponse()?->getStatusCode() : null;
            if (null === $responseId && (null === $status || $status >= 500)) {
                throw new PendingFormGeneration(null);
            }
            if (null !== $responseId && (null === $status || 429 === $status || $status >= 500)) {
                // A transient poll failure never starts a second paid request.
                throw new PendingFormGeneration($responseId);
            }
            if (null !== $responseId && 404 === $status) {
                throw new FormGenerationException(Freeform::t('The OpenAI generation is no longer available. Check the Forms list before starting another request.'));
            }

            throw $exception;
        }
        $data = json_decode((string) $response->getBody(), true, flags: \JSON_THROW_ON_ERROR);
        $id = $data['id'] ?? null;
        if (!\is_string($id) || !preg_match('/^resp_[a-zA-Z0-9_-]{1,200}$/D', $id) || (null !== $responseId && $id !== $responseId)) {
            throw new FormGenerationException(Freeform::t('OpenAI returned an invalid generation response. Check the Forms list before starting another request.'));
        }
        if (\in_array($data['status'] ?? null, ['queued', 'in_progress'], true)) {
            throw new PendingFormGeneration($id);
        }
        if ('completed' !== ($data['status'] ?? null)) {
            if ('max_output_tokens' === ($data['incomplete_details']['reason'] ?? null)) {
                throw new FormGenerationException(Freeform::t('The AI response was cut short by its output limit. Increase Max Tokens in the OpenAI integration or try a smaller section. No form was saved.'));
            }

            throw new FormGenerationException(Freeform::t('OpenAI could not complete form generation. Check the selected model, reasoning level, and account limits. No form was saved.'));
        }
        $text = '';
        foreach ($data['output'] ?? [] as $item) {
            if ('message' !== ($item['type'] ?? null) || 'assistant' !== ($item['role'] ?? null)) {
                continue;
            }
            foreach ($item['content'] ?? [] as $part) {
                if ('output_text' === ($part['type'] ?? null)) {
                    $text .= $part['text'] ?? '';
                }
            }
        }

        return $text;
    }
}
