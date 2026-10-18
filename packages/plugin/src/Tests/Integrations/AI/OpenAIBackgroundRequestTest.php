<?php

namespace Solspace\Freeform\Tests\Integrations\AI;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\ConnectException;
use GuzzleHttp\Handler\MockHandler;
use GuzzleHttp\HandlerStack;
use GuzzleHttp\Middleware;
use GuzzleHttp\Psr7\Request;
use GuzzleHttp\Psr7\Response;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Integrations\AI\OpenAI\Versions\OpenAIV1;
use Solspace\Freeform\Library\AI\FormGenerationException;
use Solspace\Freeform\Library\AI\PendingFormGeneration;
use Solspace\Freeform\Library\AI\ReferenceFile;

#[CoversClass(OpenAIV1::class)]
class OpenAIBackgroundRequestTest extends TestCase
{
    private OpenAIV1 $integration;
    private array $history = [];

    protected function setUp(): void
    {
        $this->integration = (new \ReflectionClass(OpenAIV1::class))->newInstanceWithoutConstructor();
        (new \ReflectionProperty(OpenAIV1::class, 'model'))->setValue($this->integration, 'gpt-6.1-sol');
    }

    public function testStartsWithNativeReferencesConfiguredBudgetAndReasoningThenOnlyRetrieves(): void
    {
        (new \ReflectionProperty(OpenAIV1::class, 'reasoningEffort'))->setValue($this->integration, 'high');
        (new \ReflectionProperty(OpenAIV1::class, 'maxTokens'))->setValue($this->integration, 50000);
        $client = $this->client([
            new Response(200, [], json_encode(['id' => 'resp_saved', 'status' => 'queued'])),
            new Response(200, [], json_encode(['id' => 'resp_saved', 'status' => 'in_progress'])),
            $this->completed(),
        ]);
        $pdf = ReferenceFile::restore(['name' => 'reference-1.pdf', 'mimeType' => 'application/pdf', 'data' => base64_encode("%PDF-1.4\n%%EOF")]);
        $png = ReferenceFile::restore(['name' => 'reference-2.png', 'mimeType' => 'image/png', 'data' => 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aZ1cAAAAASUVORK5CYII=']);
        self::assertSame('resp_saved', $this->pending($client, ['referenceFiles' => [$pdf, $png]]));
        self::assertSame('resp_saved', $this->pending($client, ['response_id' => 'resp_saved']));
        self::assertSame('{"fields":[]}', $this->integration->processAiRequest($client, 'system', 'user', ['background' => true, 'response_id' => 'resp_saved']));
        $payload = json_decode((string) $this->history[0]['request']->getBody(), true);
        self::assertTrue($payload['background']);
        self::assertTrue($payload['store']);
        self::assertSame('gpt-6.1-sol', $payload['model']);
        self::assertSame(['effort' => 'high'], $payload['reasoning']);
        self::assertSame(50000, $payload['max_output_tokens']);
        self::assertSame('system', $payload['instructions']);
        self::assertSame('input_file', $payload['input'][0]['content'][1]['type']);
        self::assertSame($pdf->getDataUrl(), $payload['input'][0]['content'][1]['file_data']);
        self::assertSame($png->getDataUrl(), $payload['input'][0]['content'][2]['image_url']);
        self::assertSame(['POST', 'GET', 'GET'], array_map(static fn ($entry) => $entry['request']->getMethod(), $this->history));
        foreach (\array_slice($this->history, 1) as $entry) {
            self::assertStringEndsWith('/responses/resp_saved', (string) $entry['request']->getUri());
            self::assertSame('', (string) $entry['request']->getBody());
            self::assertSame(10, $entry['options']['timeout']);
        }
    }

    public function testModelDefaultDoesNotSendReasoningInEitherApi(): void
    {
        $client = $this->client([$this->completed(), new Response(200, [], '{"choices":[{"message":{"content":"text"}}]}')]);
        $this->integration->processAiRequest($client, 'system', 'user', ['background' => true]);
        $this->integration->processAiRequest($client, 'system', 'user');
        foreach ($this->history as $entry) {
            $payload = json_decode((string) $entry['request']->getBody(), true);
            self::assertArrayNotHasKey('reasoning', $payload);
            self::assertArrayNotHasKey('reasoning_effort', $payload);
        }
    }

    public function testConfiguredReasoningAlsoAppliesToSubmissionProcessing(): void
    {
        (new \ReflectionProperty(OpenAIV1::class, 'reasoningEffort'))->setValue($this->integration, 'high');
        $client = $this->client([new Response(200, [], '{"choices":[{"message":{"content":"text"}}]}')]);
        $this->integration->processAiRequest($client, 'system', 'user');
        self::assertSame('high', json_decode((string) $this->history[0]['request']->getBody(), true)['reasoning_effort']);
    }

    #[TestWith([429])]
    #[TestWith([502])]
    #[TestWith([504])]
    public function testTransientPollErrorsKeepOriginalId(int $status): void
    {
        $client = $this->client([new Response($status, [], '<html>PRIVATE upstream error</html>')]);
        self::assertSame('resp_saved', $this->pending($client, ['response_id' => 'resp_saved']));
        self::assertSame('GET', $this->history[0]['request']->getMethod());
    }

    public function testLostSubmissionResponseIsUncertainAndDoesNotRetry(): void
    {
        $client = $this->client([new ConnectException('PRIVATE data', new Request('POST', 'https://api.openai.com/v1/responses'))]);
        self::assertNull($this->pending($client));
        self::assertCount(1, $this->history);
    }

    #[TestWith(['incomplete', ['reason' => 'max_output_tokens'], 'Increase Max Tokens'])]
    #[TestWith(['failed', null, 'could not complete'])]
    #[TestWith(['cancelled', null, 'could not complete'])]
    public function testIncompleteResponsesAreNeverImported(string $status, ?array $details, string $message): void
    {
        $client = $this->client([new Response(200, [], json_encode(['id' => 'resp_saved', 'status' => $status, 'incomplete_details' => $details, 'error' => ['message' => 'PRIVATE'], 'output' => [['type' => 'message', 'role' => 'assistant', 'content' => [['type' => 'output_text', 'text' => '{"fields":[]}']]]]]))]);
        $this->expectException(FormGenerationException::class);
        $this->expectExceptionMessage($message);
        $this->integration->processAiRequest($client, 'system', 'user', ['background' => true, 'response_id' => 'resp_saved']);
    }

    public function testInvalidSavedIdCannotChangeTheApiEndpoint(): void
    {
        $client = $this->client([]);
        $this->expectException(FormGenerationException::class);
        $this->integration->processAiRequest($client, 'system', 'user', ['background' => true, 'response_id' => '../models']);
    }

    private function pending(Client $client, array $options = []): ?string
    {
        try {
            $this->integration->processAiRequest($client, 'system', 'user', ['background' => true] + $options);
            self::fail('Expected pending generation.');
        } catch (PendingFormGeneration $pending) {
            return $pending->responseId;
        }
    }

    private function completed(): Response
    {
        return new Response(200, [], json_encode(['id' => 'resp_saved', 'status' => 'completed', 'output' => [
            ['type' => 'reasoning', 'summary' => []],
            ['type' => 'message', 'role' => 'assistant', 'content' => [['type' => 'output_text', 'text' => '{"fields":[]}']]],
        ]]));
    }

    private function client(array $responses): Client
    {
        $stack = HandlerStack::create(new MockHandler($responses));
        $stack->push(Middleware::history($this->history));

        return new Client(['handler' => $stack]);
    }
}
