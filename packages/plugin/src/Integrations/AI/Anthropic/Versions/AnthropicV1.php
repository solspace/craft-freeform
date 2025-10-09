<?php

namespace Solspace\Freeform\Integrations\AI\Anthropic\Versions;

use GuzzleHttp\Client;
use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Attributes\Property\Edition;
use Solspace\Freeform\Integrations\AI\Anthropic\BaseAnthropicIntegration;
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;

#[Edition(Edition::PRO)]
#[Type(
    name: 'Anthropic',
    type: Type::TYPE_AI,
    version: 'v1',
    readme: __DIR__.'/../README.md',
    iconPath: __DIR__.'/../icon.svg',
)]
class AnthropicV1 extends BaseAnthropicIntegration
{
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
        $payload = [
            'model' => $options['model'] ?? $this->getModel(),
            'max_tokens' => $options['max_tokens'] ?? $this->getMaxTokens(),
            'system' => $systemPrompt,
            'messages' => [
                [
                    'role' => 'user',
                    'content' => $userContent,
                ],
            ],
        ];

        // Add temperature if specified
        if (isset($options['temperature']) || null !== $this->getTemperature()) {
            $payload['temperature'] = $options['temperature'] ?? $this->getTemperature();
        }

        $response = $client->post(
            $this->getEndpoint('/messages'),
            ['json' => $payload]
        );

        $data = json_decode((string) $response->getBody(), true);

        return $data['content'][0]['text'] ?? '';
    }
}
