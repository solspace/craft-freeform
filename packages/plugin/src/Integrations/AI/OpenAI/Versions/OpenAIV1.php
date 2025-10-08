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
                    'content' => $userContent,
                ],
            ],
        ];

        $response = $client->post(
            $this->getEndpoint('/chat/completions'),
            ['json' => $payload]
        );

        $data = json_decode((string) $response->getBody(), true);

        return $data['choices'][0]['message']['content'] ?? '';
    }
}
