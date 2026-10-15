<?php

namespace Solspace\Freeform\Integrations\AI\Anthropic\Versions;

use GuzzleHttp\Client;
use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Attributes\Property\Edition;
use Solspace\Freeform\Integrations\AI\Anthropic\BaseAnthropicIntegration;
use Solspace\Freeform\Integrations\AI\ReferenceAiIntegrationInterface;
use Solspace\Freeform\Library\AI\ReferenceFile;
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;

#[Edition(Edition::PRO)]
#[Type(
    name: 'Anthropic',
    type: Type::TYPE_AI,
    version: 'v1',
    readme: __DIR__.'/../README.md',
    iconPath: __DIR__.'/../icon.svg',
)]
class AnthropicV1 extends BaseAnthropicIntegration implements ReferenceAiIntegrationInterface
{
    public function getReferenceMimeTypes(): array
    {
        $model = $this->getModel();
        if (preg_match('/^claude-3-(?:haiku|sonnet|opus)/i', $model)) {
            return ['image/png', 'image/jpeg'];
        }

        return preg_match('/^claude-(?:3-[57]|[4-9]|(?:sonnet|opus|haiku)-[4-9])/i', $model) ? ReferenceFile::MIME_TYPES : [];
    }

    public function getApiRootUrl(): string
    {
        return 'https://api.anthropic.com/v1';
    }

    public function checkConnection(Client $client): bool
    {
        $response = $client->get($this->getEndpoint('/models'));
        $data = json_decode((string) $response->getBody());

        return isset($data->data) && \is_array($data->data);
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
        $content = $userContent;
        if (!empty($options['referenceFiles'])) {
            $content = [];
            foreach ($options['referenceFiles'] as $file) {
                $content[] = [
                    'type' => 'application/pdf' === $file->mimeType ? 'document' : 'image',
                    'source' => ['type' => 'base64', 'media_type' => $file->mimeType, 'data' => $file->getBase64()],
                ];
            }
            $content[] = ['type' => 'text', 'text' => $userContent];
        }
        $payload = [
            'model' => $options['model'] ?? $this->getModel(),
            'max_tokens' => $options['max_tokens'] ?? $this->getMaxTokens(),
            'system' => $systemPrompt,
            'messages' => [
                [
                    'role' => 'user',
                    'content' => $content,
                ],
            ],
        ];

        // Add temperature if specified
        if (isset($options['temperature']) || null !== $this->getTemperature()) {
            $payload['temperature'] = $options['temperature'] ?? $this->getTemperature();
        }

        $response = $client->post(
            $this->getEndpoint('/messages'),
            ['json' => $payload, 'timeout' => $options['timeout'] ?? 120]
        );

        $data = json_decode((string) $response->getBody(), true);

        return $data['content'][0]['text'] ?? '';
    }
}
