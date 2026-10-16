<?php

namespace Solspace\Freeform\Tests\Services;

use GuzzleHttp\Client;
use GuzzleHttp\Handler\MockHandler;
use GuzzleHttp\HandlerStack;
use GuzzleHttp\Middleware;
use GuzzleHttp\Psr7\Response;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Attributes\Property\Input\TabularData;
use Solspace\Freeform\Attributes\Property\PropertyCollection;
use Solspace\Freeform\Bundles\Attributes\Property\PropertyProvider;
use Solspace\Freeform\Bundles\Integrations\Providers\IntegrationClientProvider;
use Solspace\Freeform\Bundles\Transformers\Builder\Form\FormTransformer;
use Solspace\Freeform\Fields\Implementations\Pro\OpinionScaleField;
use Solspace\Freeform\Integrations\AI\OpenAI\Versions\OpenAIV1;
use Solspace\Freeform\Library\AI\PendingFormGeneration;
use Solspace\Freeform\Services\FormGenerationService;
use Solspace\Freeform\Services\FormsService;
use Solspace\Freeform\Services\Integrations\IntegrationsService;

#[CoversClass(FormGenerationService::class)]
class FormGenerationServiceTest extends TestCase
{
    public function testOpenAIGenerationHonorsConfiguredBudgetAndDoesNotForceLowReasoning(): void
    {
        $integration = (new \ReflectionClass(OpenAIV1::class))->newInstanceWithoutConstructor();
        (new \ReflectionProperty($integration, 'model'))->setValue($integration, 'gpt-6.1-sol');
        (new \ReflectionProperty($integration, 'maxTokens'))->setValue($integration, 45000);
        (new \ReflectionProperty($integration, 'reasoningEffort'))->setValue($integration, 'high');
        $history = [];
        $stack = HandlerStack::create(new MockHandler([
            new Response(200, [], '{"id":"resp_test","status":"queued"}'),
        ]));
        $stack->push(Middleware::history($history));
        $client = new Client(['handler' => $stack]);
        $provider = $this->createMock(IntegrationClientProvider::class);
        $provider->method('getAuthorizedClient')->willReturn($client);
        $service = $this->getMockBuilder(FormGenerationService::class)->setConstructorArgs([
            $this->createMock(IntegrationsService::class), $provider,
            $this->createMock(PropertyProvider::class), $this->createMock(FormTransformer::class), $this->createMock(FormsService::class),
        ])->onlyMethods(['validateRequest', 'getSystemPrompt'])->getMock();
        $service->method('validateRequest')->willReturn($integration);
        $service->method('getSystemPrompt')->willReturn('system');

        try {
            $service->generate('prompt', null, 'integration', background: []);
            self::fail('Expected pending response.');
        } catch (PendingFormGeneration $pending) {
            self::assertSame('resp_test', $pending->responseId);
        }
        $payload = json_decode((string) $history[0]['request']->getBody(), true);
        self::assertSame(['effort' => 'high'], $payload['reasoning']);
        self::assertSame(45000, $payload['max_output_tokens']);
    }

    public function testOpinionScaleOptionsUseTabularRows(): void
    {
        $scales = new TabularData(value: []);
        $scales->handle = 'scales';

        $propertyProvider = $this->createMock(PropertyProvider::class);
        $propertyProvider->expects($this->once())
            ->method('getEditableProperties')
            ->with(OpinionScaleField::class)
            ->willReturn((new PropertyCollection())->add($scales))
        ;

        $service = new FormGenerationService(
            $this->createMock(IntegrationsService::class),
            $this->createMock(IntegrationClientProvider::class),
            $propertyProvider,
            $this->createMock(FormTransformer::class),
            $this->createMock(FormsService::class),
        );

        $method = new \ReflectionMethod(FormGenerationService::class, 'mergeFieldProperties');
        $properties = $method->invoke($service, OpinionScaleField::class, [
            'type' => 'OpinionScale',
            'options' => ['Poor', ['value' => '0', 'label' => 'Zero'], ['value' => 1, 'label' => 'Good']],
        ]);

        $this->assertSame([['Poor', 'Poor'], ['0', 'Zero'], ['1', 'Good']], $properties['scales']);
        $this->assertArrayNotHasKey('options', $properties);
    }
}
