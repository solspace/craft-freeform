<?php

namespace Solspace\Freeform\Integrations\AI\OpenAI\Versions;

use GuzzleHttp\Client;
use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Attributes\Property\Edition;
use Solspace\Freeform\Integrations\AI\OpenAI\BaseOpenAIIntegration;
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;

#[Edition(Edition::PRO)]
#[Type(
    name: 'OpenAI',
    type: Type::TYPE_AI,
    version: 'v1',
    readme: __DIR__.'/../README.md',
    iconPath: __DIR__.'/../icon.svg',
)]
class OpenAIV1 extends BaseOpenAIIntegration
{
    public function getApiRootUrl(): string
    {
        return 'https://api.openai.com/v1';
    }

    public function checkConnection(Client $client): bool
    {
        try {
            $response = $client->get($this->getEndpoint('/models'), [
                'headers' => [
                    'Authorization' => 'Bearer '.$this->getApiKey(),
                ],
            ]);
            $data = json_decode((string) $response->getBody(), true);

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

    public function processAiRequest(string $systemPrompt, string $userContent, array $options = []): string
    {
        $client = new Client([
            'headers' => [
                'Authorization' => 'Bearer '.$this->getApiKey(),
                'Content-Type' => 'application/json',
            ],
        ]);

        $payload = [
            'model' => $options['model'] ?? $this->getModel(),
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
            'temperature' => $options['temperature'] ?? $this->getTemperature(),
        ];

        $response = $client->post($this->getEndpoint('/chat/completions'), [
            'json' => $payload,
        ]);

        $data = json_decode((string) $response->getBody(), true);

        return $data['choices'][0]['message']['content'] ?? '';
    }
}
