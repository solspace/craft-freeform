<?php

namespace Solspace\Freeform\Integrations\AI\SolspaceAI\Versions;

use GuzzleHttp\Client;
use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Attributes\Property\Edition;
use Solspace\Freeform\Integrations\AI\ReferenceAiIntegrationInterface;
use Solspace\Freeform\Integrations\AI\SolspaceAI\BaseSolspaceAIIntegration;
use Solspace\Freeform\Library\AI\FormGenerationResponse;
use Solspace\Freeform\Library\AI\ReferenceFile;
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;
use Solspace\Freeform\Library\Integrations\SingletonIntegrationInterface;

#[Edition(Edition::PRO)]
#[Type(
    name: 'SolspaceAI',
    type: Type::TYPE_AI,
    version: 'v1',
    readme: __DIR__.'/../README.md',
    iconPath: __DIR__.'/../icon.svg',
)]
class SolspaceAIV1 extends BaseSolspaceAIIntegration implements SingletonIntegrationInterface, ReferenceAiIntegrationInterface
{
    public function getReferenceMimeTypes(): array
    {
        // The hosted service chooses the document-capable model server-side.
        return ReferenceFile::MIME_TYPES;
    }

    public function getApiRootUrl(): string
    {
        return $this->getApiBaseUrl();
    }

    public function checkConnection(Client $client): bool
    {
        try {
            $response = $client->get($this->getEndpoint('/models'));
            $statusCode = $response->getStatusCode();
            $body = (string) $response->getBody();
            $data = json_decode($body, true);

            if (200 !== $statusCode) {
                return false;
            }

            return isset($data['data']) && \is_array($data['data']);
        } catch (\Exception $e) {
            return false;
        }
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
            $content = [['type' => 'text', 'text' => $userContent]];
            foreach ($options['referenceFiles'] as $file) {
                $content[] = 'application/pdf' === $file->mimeType
                    ? ['type' => 'file', 'file' => ['filename' => $file->name, 'file_data' => $file->getDataUrl()]]
                    : ['type' => 'image_url', 'image_url' => ['url' => $file->getDataUrl(), 'detail' => 'high']];
            }
        }
        $payload = [
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
        // Keep model selection on SolspaceAI; an empty or client-selected model
        // would bypass the proxy's default or conflict with its key restrictions.
        if (isset($options['max_tokens'])) {
            $payload['max_completion_tokens'] = $options['max_tokens'];
        }

        $response = $client->post($this->getEndpoint('/chat/completions'), [
            'json' => $payload,
            'timeout' => $options['timeout'] ?? 120,
        ]);

        $data = json_decode((string) $response->getBody(), true);
        FormGenerationResponse::requireComplete($data['choices'][0]['finish_reason'] ?? null, $options);

        return $data['choices'][0]['message']['content'] ?? '';
    }

    public function listModels(bool $refresh = false): array
    {
        try {
            $client = \Craft::createGuzzleClient([
                'headers' => [
                    'Authorization' => 'Bearer '.$this->getApiKey(),
                ],
            ]);

            $response = $client->get($this->getEndpoint('/models'));
            $data = json_decode((string) $response->getBody(), true);

            $models = [];
            foreach ($data['data'] ?? [] as $item) {
                if (!isset($item['id'])) {
                    continue;
                }
                $models[] = [
                    'id' => $item['id'],
                    'label' => $item['id'],
                ];
            }

            return $models;
        } catch (\Throwable) {
            return [];
        }
    }
}
