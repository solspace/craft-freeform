<?php

namespace Solspace\Freeform\Integrations\AI\Gemini\Versions;

use GuzzleHttp\Client;
use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Attributes\Property\Edition;
use Solspace\Freeform\Integrations\AI\Gemini\BaseGeminiIntegration;
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;

#[Edition(Edition::PRO)]
#[Type(
    name: 'Gemini',
    type: Type::TYPE_AI,
    version: 'v1beta',
    readme: __DIR__.'/../README.md',
    iconPath: __DIR__.'/../icon.svg',
)]
class GeminiV1Beta extends BaseGeminiIntegration
{
    public function getApiRootUrl(): string
    {
        return 'https://generativelanguage.googleapis.com/v1beta';
    }

    public function checkConnection(Client $client): bool
    {
        try {
            $response = $client->get($this->getEndpoint('/models'), [
                'query' => [
                    'key' => $this->getApiKey(),
                ],
            ]);
            $data = json_decode((string) $response->getBody(), true);

            return isset($data['models']) && \is_array($data['models']);
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
                'Content-Type' => 'application/json',
            ],
        ]);

        $payload = [
            // Provide system instructions via systemInstruction (no role required here)
            'systemInstruction' => [
                'parts' => [
                    [
                        'text' => $systemPrompt,
                    ],
                ],
            ],
            // User content must include a valid role
            'contents' => [
                [
                    'role' => 'user',
                    'parts' => [
                        [
                            'text' => $userContent,
                        ],
                    ],
                ],
            ],
            'generationConfig' => [
                'maxOutputTokens' => $options['max_tokens'] ?? $this->getMaxTokens(),
                'temperature' => $options['temperature'] ?? $this->getTemperature(),
            ],
        ];

        $response = $client->post($this->getEndpoint('/models/'.($options['model'] ?? $this->getModel()).':generateContent'), [
            'query' => [
                'key' => $this->getApiKey(),
            ],
            'json' => $payload,
        ]);

        $data = json_decode((string) $response->getBody(), true);

        return $data['candidates'][0]['content']['parts'][0]['text'] ?? '';
    }
}
