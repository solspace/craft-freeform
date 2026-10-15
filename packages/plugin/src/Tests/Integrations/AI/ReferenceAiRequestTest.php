<?php

namespace Solspace\Freeform\Tests\Integrations\AI;

use GuzzleHttp\Client;
use GuzzleHttp\Handler\MockHandler;
use GuzzleHttp\HandlerStack;
use GuzzleHttp\Middleware;
use GuzzleHttp\Psr7\Response;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Integrations\AI\Anthropic\Versions\AnthropicV1;
use Solspace\Freeform\Integrations\AI\Gemini\Versions\GeminiV1Beta;
use Solspace\Freeform\Integrations\AI\OpenAI\Versions\OpenAIV1;
use Solspace\Freeform\Integrations\AI\SolspaceAI\Versions\SolspaceAIV1;
use Solspace\Freeform\Library\AI\ReferenceFile;
use yii\web\UploadedFile;

#[CoversClass(OpenAIV1::class)]
#[CoversClass(AnthropicV1::class)]
#[CoversClass(GeminiV1Beta::class)]
#[CoversClass(SolspaceAIV1::class)]
class ReferenceAiRequestTest extends TestCase
{
    #[TestWith(['gpt-5.6-luna', true])]
    #[TestWith(['gpt-6.1-sol', true])]
    #[TestWith(['gpt-5-mini', true])]
    #[TestWith(['gpt-5-pro', false])]
    #[TestWith(['gpt-5.2-chat-latest', false])]
    #[TestWith(['gpt-4o', false])]
    #[TestWith(['o3', false])]
    public function testInteractiveReasoningBudgetIsSentOnlyToCompatibleModels(string $model, bool $supported): void
    {
        $integration = (new \ReflectionClass(OpenAIV1::class))->newInstanceWithoutConstructor();
        $history = [];
        $response = json_encode(['choices' => [['message' => ['content' => '{"fields":[]}']]]]);
        $stack = HandlerStack::create(new MockHandler([new Response(200, [], $response), new Response(200, [], $response)]));
        $stack->push(Middleware::history($history));
        $client = new Client(['handler' => $stack]);
        $integration->processAiRequest($client, 'system', 'user', ['model' => $model, 'reasoning_effort' => 'low']);
        $payload = json_decode((string) $history[0]['request']->getBody(), true);
        self::assertSame($model, $payload['model']);
        if ($supported) {
            self::assertSame('low', $payload['reasoning_effort']);
        } else {
            self::assertArrayNotHasKey('reasoning_effort', $payload);
        }

        $integration->processAiRequest($client, 'system', 'user', ['model' => $model]);
        self::assertArrayNotHasKey('reasoning_effort', json_decode((string) $history[1]['request']->getBody(), true));
    }

    #[TestWith([OpenAIV1::class])]
    #[TestWith([AnthropicV1::class])]
    #[TestWith([GeminiV1Beta::class])]
    #[TestWith([SolspaceAIV1::class])]
    public function testNativePdfAndImagePayloadsAndTextCompatibility(string $class): void
    {
        $integration = (new \ReflectionClass($class))->newInstanceWithoutConstructor();
        $path = tempnam(sys_get_temp_dir(), 'ff-pdf-');
        file_put_contents($path, "%PDF-1.4\n%%EOF");
        [$pdf] = ReferenceFile::fromUploads([new UploadedFile(['name' => 'form.pdf', 'tempName' => $path, 'size' => filesize($path), 'error' => 0])]);
        unlink($path);
        $path = tempnam(sys_get_temp_dir(), 'ff-png-');
        file_put_contents($path, base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aZ1cAAAAASUVORK5CYII='));
        [$png] = ReferenceFile::fromUploads([new UploadedFile(['name' => 'form.png', 'tempName' => $path, 'size' => filesize($path), 'error' => 0])]);
        unlink($path);
        $response = match ($class) {
            OpenAIV1::class, SolspaceAIV1::class => ['choices' => [['message' => ['content' => '{"fields":[]}']]]],
            AnthropicV1::class => ['content' => [['text' => '{"fields":[]}']]],
            default => ['candidates' => [['content' => ['parts' => [['text' => '{"fields":[]}']]]]]],
        };
        $history = [];
        $stack = HandlerStack::create(new MockHandler([new Response(200, [], json_encode($response)), new Response(200, [], json_encode($response))]));
        $stack->push(Middleware::history($history));
        $client = new Client(['handler' => $stack]);
        self::assertSame('{"fields":[]}', $integration->processAiRequest($client, 'system', 'user', ['referenceFiles' => [$pdf, $png], 'timeout' => 99, 'max_tokens' => 12000, 'model' => 'client-model']));
        $payload = json_decode((string) $history[0]['request']->getBody(), true);
        self::assertSame(99, $history[0]['options']['timeout']);
        if (\in_array($class, [OpenAIV1::class, SolspaceAIV1::class], true)) {
            $parts = $payload['messages'][1]['content'];
            self::assertSame($pdf->getDataUrl(), $parts[1]['file']['file_data']);
            self::assertSame($png->getDataUrl(), $parts[2]['image_url']['url']);
            self::assertStringEndsWith('/chat/completions', (string) $history[0]['request']->getUri());
            if (SolspaceAIV1::class === $class) {
                self::assertArrayNotHasKey('model', $payload);
                self::assertSame(12000, $payload['max_completion_tokens']);
                self::assertSame(ReferenceFile::MIME_TYPES, $integration->getReferenceMimeTypes());
                self::assertSame('', $integration->getModel());
                self::assertSame('https://ai.solspace.net/v1/chat/completions', (string) $history[0]['request']->getUri());
            }
        } elseif (AnthropicV1::class === $class) {
            $parts = $payload['messages'][0]['content'];
            self::assertSame('document', $parts[0]['type']);
            self::assertSame($pdf->getBase64(), $parts[0]['source']['data']);
            self::assertSame('image', $parts[1]['type']);
        } else {
            $parts = $payload['contents'][0]['parts'];
            self::assertSame(['mime_type' => 'application/pdf', 'data' => $pdf->getBase64()], $parts[1]['inline_data']);
            self::assertSame('image/png', $parts[2]['inline_data']['mime_type']);
        }
        $integration->processAiRequest($client, 'system', 'text-only');
        $plain = json_decode((string) $history[1]['request']->getBody(), true);
        self::assertSame('text-only', match ($class) {
            OpenAIV1::class, SolspaceAIV1::class => $plain['messages'][1]['content'],
            AnthropicV1::class => $plain['messages'][0]['content'],
            default => $plain['contents'][0]['parts'][0]['text'],
        });
        if (SolspaceAIV1::class === $class) {
            self::assertSame(['messages' => [['role' => 'system', 'content' => 'system'], ['role' => 'user', 'content' => 'text-only']]], $plain);
        }
    }

    #[TestWith([OpenAIV1::class, 'gpt-3.5-turbo', false])]
    #[TestWith([OpenAIV1::class, 'o3-mini', false])]
    #[TestWith([OpenAIV1::class, 'gpt-5.6-luna', true])]
    #[TestWith([OpenAIV1::class, 'gpt-4o', true])]
    #[TestWith([AnthropicV1::class, 'claude-2', false])]
    #[TestWith([AnthropicV1::class, 'claude-sonnet-4-5', true])]
    #[TestWith([GeminiV1Beta::class, 'gemini-1.0-pro', false])]
    #[TestWith([GeminiV1Beta::class, 'gemini-3.5-flash-lite', true])]
    public function testModelCapabilities(string $class, string $model, bool $supported): void
    {
        $integration = (new \ReflectionClass($class))->newInstanceWithoutConstructor();
        (new \ReflectionProperty($class, 'model'))->setValue($integration, $model);
        self::assertSame($supported ? ReferenceFile::MIME_TYPES : [], $integration->getReferenceMimeTypes());
    }
}
