<?php

namespace Solspace\Freeform\Integrations\AI\SolspaceAI\Versions;

use GuzzleHttp\Client;
use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Attributes\Property\Edition;
use Solspace\Freeform\Integrations\AI\SolspaceAI\BaseSolspaceAIIntegration;
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;

#[Edition(Edition::PRO)]
#[Type(
    name: 'SolspaceAI',
    type: Type::TYPE_AI,
    version: 'v1',
    readme: __DIR__.'/../README.md',
    iconPath: __DIR__.'/../icon.svg',
)]
class SolspaceAIV1 extends BaseSolspaceAIIntegration
{
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
        $payload = [
            'messages' => [
                [
                    'role' => 'system',
                    'content' => $systemPrompt,
                ],
                [
                    'role' => 'user',
                    'content' => $userContent,
                ],
            ],
            'max_tokens' => $options['max_tokens'] ?? $this->getMaxTokens(),
        ];

        $response = $client->post($this->getEndpoint('/chat/completions'), [
            'json' => $payload,
        ]);

        $data = json_decode((string) $response->getBody(), true);

        return $data['choices'][0]['message']['content'] ?? '';
    }

    public function listModels(bool $refresh = false): array
    {
        try {
            $client = new Client([
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
