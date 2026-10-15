<?php

namespace Solspace\Freeform\Integrations\AI\Gemini\Versions;

use GuzzleHttp\Client;
use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Attributes\Property\Edition;
use Solspace\Freeform\Integrations\AI\Gemini\BaseGeminiIntegration;
use Solspace\Freeform\Integrations\AI\ReferenceAiIntegrationInterface;
use Solspace\Freeform\Library\AI\ReferenceFile;
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;

#[Edition(Edition::PRO)]
#[Type(
    name: 'Gemini',
    type: Type::TYPE_AI,
    version: 'v1beta',
    readme: __DIR__.'/../README.md',
    iconPath: __DIR__.'/../icon.svg',
)]
class GeminiV1Beta extends BaseGeminiIntegration implements ReferenceAiIntegrationInterface
{
    public function getReferenceMimeTypes(): array
    {
        return preg_match('/^(?:models\/)?gemini-(?!1\.0|.*(?:embedding|image|tts))/i', $this->getModel()) ? ReferenceFile::MIME_TYPES : [];
    }

    public function getApiRootUrl(): string
    {
        return 'https://generativelanguage.googleapis.com/v1beta';
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
        $parts = [['text' => $userContent]];
        foreach ($options['referenceFiles'] ?? [] as $file) {
            $parts[] = ['inline_data' => ['mime_type' => $file->mimeType, 'data' => $file->getBase64()]];
        }
        $payload = [
            // Provide system instructions via systemInstruction (no role required here)
            'systemInstruction' => [
                'parts' => [['text' => $systemPrompt]],
            ],
            // User content must include a valid role
            'contents' => [
                [
                    'role' => 'user',
                    'parts' => $parts,
                ],
            ],
            'generationConfig' => [
                'maxOutputTokens' => $options['max_tokens'] ?? $this->getMaxTokens(),
                'temperature' => $options['temperature'] ?? $this->getTemperature(),
            ],
        ];

        $model = $options['model'] ?? $this->getModel();
        $response = $client->post(
            $this->getEndpoint('/models/'.$model.':generateContent'),
            ['json' => $payload, 'timeout' => $options['timeout'] ?? 120]
        );

        $data = json_decode((string) $response->getBody(), true);

        return $data['candidates'][0]['content']['parts'][0]['text'] ?? '';
    }
}
