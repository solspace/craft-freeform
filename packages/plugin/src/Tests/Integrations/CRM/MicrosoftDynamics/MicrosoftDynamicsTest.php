<?php

namespace Solspace\Freeform\Tests\Integrations\CRM\MicrosoftDynamics;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\ConnectException;
use GuzzleHttp\Exception\RequestException;
use GuzzleHttp\Handler\MockHandler;
use GuzzleHttp\HandlerStack;
use GuzzleHttp\Middleware;
use GuzzleHttp\Psr7\Request;
use GuzzleHttp\Psr7\Response;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;
use Psr\Log\NullLogger;
use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Attributes\Property\Implementations\FieldMapping\FieldMapItem;
use Solspace\Freeform\Attributes\Property\Implementations\FieldMapping\FieldMapping;
use Solspace\Freeform\Bundles\Integrations\IntegrationsBundle;
use Solspace\Freeform\Bundles\Integrations\Providers\IntegrationClientProvider;
use Solspace\Freeform\Events\Integrations\GetAuthorizedClientEvent;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Implementations\CheckboxField;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Integrations\CRM\MicrosoftDynamics\MicrosoftDynamics;
use Solspace\Freeform\Integrations\CRM\MicrosoftDynamics\MicrosoftDynamicsBundle;
use Solspace\Freeform\Integrations\CRM\MicrosoftDynamics\MicrosoftDynamicsTokenProvider;
use Solspace\Freeform\Integrations\CRM\MicrosoftDynamics\MicrosoftDynamicsValueConverter;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;
use Solspace\Freeform\Library\Integrations\APIIntegrationInterface;
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;
use yii\base\Event;

#[CoversClass(MicrosoftDynamics::class)]
#[CoversClass(MicrosoftDynamicsBundle::class)]
#[CoversClass(MicrosoftDynamicsTokenProvider::class)]
#[CoversClass(MicrosoftDynamicsValueConverter::class)]
class MicrosoftDynamicsTest extends TestCase
{
    private array $history = [];
    private MicrosoftDynamicsBundle $bundle;
    private IntegrationsBundle $genericProcessor;

    protected function setUp(): void
    {
        parent::setUp();
        $this->history = [];
        $this->genericProcessor = (new \ReflectionClass(IntegrationsBundle::class))->newInstanceWithoutConstructor();
        Event::on(APIIntegrationInterface::class, APIIntegrationInterface::EVENT_PROCESS_VALUE, [$this->genericProcessor, 'processValue']);
        $this->bundle = new MicrosoftDynamicsBundle(new MicrosoftDynamicsTokenProvider());
    }

    protected function tearDown(): void
    {
        Event::off(APIIntegrationInterface::class, APIIntegrationInterface::EVENT_PROCESS_VALUE, [$this->genericProcessor, 'processValue']);
        Event::off(MicrosoftDynamics::class, MicrosoftDynamics::EVENT_PROCESS_VALUE, [$this->bundle, 'processValue']);
        Event::off(IntegrationClientProvider::class, IntegrationClientProvider::EVENT_GET_CLIENT, [$this->bundle, 'configureClient']);
        parent::tearDown();
    }

    public function testTokenRequestUsesClientCredentialsAndReusesUnexpiredToken(): void
    {
        $provider = new MicrosoftDynamicsTokenProvider();
        $integration = $this->integration();
        $client = $this->client([$this->token('token-a')]);
        self::assertSame('token-a', $provider->getAccessToken($integration, $client));
        self::assertSame('token-a', $provider->getAccessToken($integration, $client));
        self::assertCount(1, $this->history);

        $request = $this->history[0]['request'];
        self::assertSame('https://login.microsoftonline.com/11111111-1111-1111-1111-111111111111/oauth2/v2.0/token', (string) $request->getUri());
        parse_str((string) $request->getBody(), $body);
        self::assertSame([
            'grant_type' => 'client_credentials',
            'client_id' => '22222222-2222-2222-2222-222222222222',
            'client_secret' => 'test-secret',
            'scope' => 'https://example.crm4.dynamics.com/.default',
        ], $body);
        self::assertFalse($this->history[0]['options']['allow_redirects']);
    }

    public function testExpiringTokensAndCredentialChangesAcquireNewTokens(): void
    {
        $provider = new MicrosoftDynamicsTokenProvider();
        $client = $this->client([$this->token('short', 30), $this->token('renewed'), $this->token('rotated'), $this->token('other-environment')]);
        $integration = $this->integration();
        self::assertSame('short', $provider->getAccessToken($integration, $client));
        self::assertSame('renewed', $provider->getAccessToken($integration, $client));
        self::assertSame('rotated', $provider->getAccessToken($this->integration(['clientSecret' => 'new-secret']), $client));
        self::assertSame('other-environment', $provider->getAccessToken($this->integration(['environmentUrl' => 'https://other.crm.dynamics.com']), $client));
        self::assertCount(4, $this->history);
    }

    public function testAuthenticationErrorsDoNotExposeSecretOrOriginalException(): void
    {
        $client = $this->client([new Response(401, [], json_encode([
            'error_description' => 'sensitive test-secret', 'error_codes' => [7000215],
        ]))]);

        try {
            (new MicrosoftDynamicsTokenProvider())->getAccessToken($this->integration(), $client);
            self::fail('Expected authentication failure');
        } catch (IntegrationException $exception) {
            self::assertStringContainsString('AADSTS7000215', $exception->getMessage());
            self::assertStringNotContainsString('test-secret', $exception->getMessage());
            self::assertNull($exception->getPrevious());
        }
    }

    public function testNetworkAuthenticationErrorDoesNotRetainSensitiveRequest(): void
    {
        $client = $this->client([new ConnectException('test-secret', new Request('POST', 'https://login.microsoftonline.com', [], 'test-secret'))]);

        try {
            (new MicrosoftDynamicsTokenProvider())->getAccessToken($this->integration(), $client);
            self::fail('Expected authentication failure');
        } catch (IntegrationException $exception) {
            self::assertStringNotContainsString('test-secret', $exception->getMessage());
            self::assertNull($exception->getPrevious());
        }
    }

    #[DataProvider('invalidTokenProvider')]
    public function testInvalidTokenResponsesFailClosed(array $data): void
    {
        $this->expectException(IntegrationException::class);
        (new MicrosoftDynamicsTokenProvider())->getAccessToken($this->integration(), $this->client([new Response(200, [], json_encode($data))]));
    }

    public static function invalidTokenProvider(): iterable
    {
        yield 'missing token' => [[]];

        yield 'empty token' => [['access_token' => '', 'token_type' => 'Bearer', 'expires_in' => 3600]];

        yield 'wrong type' => [['access_token' => 'token', 'token_type' => 'Basic', 'expires_in' => 3600]];

        yield 'expired' => [['access_token' => 'token', 'token_type' => 'Bearer', 'expires_in' => 0]];

        yield 'header injection' => [['access_token' => "token\r\nHeader: value", 'token_type' => 'Bearer', 'expires_in' => 3600]];

        yield 'malformed type' => [['access_token' => 'token', 'token_type' => ['Bearer'], 'expires_in' => 3600]];
    }

    public function testAuthenticationIsLazyAndRenewsForAReusedClient(): void
    {
        $tokenClient = $this->client([$this->token('first', 30), $this->token('second')]);
        $bundle = $this->getMockBuilder(MicrosoftDynamicsBundle::class)->disableOriginalConstructor()->onlyMethods(['createTokenClient'])->getMock();
        $bundle->method('createTokenClient')->willReturn($tokenClient);
        (new \ReflectionProperty(MicrosoftDynamicsBundle::class, 'tokenProvider'))->setValue($bundle, new MicrosoftDynamicsTokenProvider());
        $integration = $this->integration();
        $event = new GetAuthorizedClientEvent($integration);
        $bundle->configureClient($event);
        self::assertSame([], $this->history);
        $stack = $event->getStack();
        $stack->setHandler(new MockHandler([new Response(200, [], '{"UserId":"user"}'), new Response(200, [], '{"UserId":"user"}')]));
        $apiHistory = [];
        $stack->push(Middleware::history($apiHistory));
        $client = new Client(array_merge($event->getConfig(), ['handler' => $stack]));
        self::assertTrue($integration->checkConnection($client));
        self::assertTrue($integration->checkConnection($client));
        self::assertCount(2, $this->history);
        self::assertSame('Bearer first', $apiHistory[0]['request']->getHeaderLine('Authorization'));
        self::assertSame('Bearer second', $apiHistory[1]['request']->getHeaderLine('Authorization'));

        $this->expectException(IntegrationException::class);

        try {
            $client->get('https://other.crm.dynamics.com/api/data/v9.2/WhoAmI');
        } finally {
            self::assertCount(2, $apiHistory);
            self::assertCount(2, $this->history);
        }
    }

    public function testAuthorizedClientChecksIdentityWithODataHeaders(): void
    {
        $provider = $this->createMock(MicrosoftDynamicsTokenProvider::class);
        $provider->method('getAccessToken')->willReturn('test-token');
        $bundle = $this->getMockBuilder(MicrosoftDynamicsBundle::class)->disableOriginalConstructor()->onlyMethods(['createTokenClient'])->getMock();
        $bundle->method('createTokenClient')->willReturn(new Client());
        (new \ReflectionProperty(MicrosoftDynamicsBundle::class, 'tokenProvider'))->setValue($bundle, $provider);
        $integration = $this->integration();
        $event = new GetAuthorizedClientEvent($integration);
        $bundle->configureClient($event);
        $stack = $event->getStack();
        $stack->setHandler(new MockHandler([new Response(200, [], '{"UserId":"application-user"}')]));
        $stack->push(Middleware::history($this->history));
        $client = new Client(array_merge($event->getConfig(), ['handler' => $stack]));
        self::assertTrue($integration->checkConnection($client));
        $request = $this->history[0]['request'];
        self::assertSame('/api/data/v9.2/WhoAmI', $request->getUri()->getPath());
        self::assertSame('Bearer test-token', $request->getHeaderLine('Authorization'));
        self::assertSame('4.0', $request->getHeaderLine('OData-Version'));
        self::assertSame('4.0', $request->getHeaderLine('OData-MaxVersion'));
        self::assertFalse($client->getConfig('allow_redirects'));
    }

    #[DataProvider('invalidSettingProvider')]
    public function testUnsafeOrIncompleteSettingsAreRejected(array $settings): void
    {
        $this->expectException(IntegrationException::class);
        $this->integration($settings)->onBeforeSave();
    }

    public static function invalidSettingProvider(): iterable
    {
        foreach (['http://example.crm.dynamics.com', 'https://example.com', 'https://example.crm.dynamics.com.evil.test', 'https://example.crm.dynamics.com/api/data/v9.2', 'https://user:pass@example.crm.dynamics.com', 'https://example.crm.dynamics.com:443', 'https://example.crm.dynamics.com?x=1', 'https://127.0.0.1'] as $url) {
            yield $url => [['environmentUrl' => $url]];
        }

        yield 'tenant path injection' => [['tenantId' => '../common']];

        yield 'missing client' => [['clientId' => '']];

        yield 'missing secret' => [['clientSecret' => '']];
    }

    public function testEnvironmentUrlNormalization(): void
    {
        $integration = $this->integration(['environmentUrl' => ' HTTPS://Example.API.CRM4.Dynamics.com/ ']);
        self::assertSame('https://example.api.crm4.dynamics.com/api/data/v9.2', $integration->getApiRootUrl());
    }

    public function testDiscoversSupportedCustomFieldsChoicesAndDateBehavior(): void
    {
        $attributes = [
            $this->attribute('lastname', 'String', ['RequiredLevel' => ['Value' => 'ApplicationRequired']]),
            $this->attribute('custom_score', 'Integer'),
            $this->attribute('custom_decimal', 'Decimal'),
            $this->attribute('donotemail', 'Boolean'),
            $this->attribute('leadsourcecode', 'Picklist'),
            $this->attribute('custom_choices', 'Virtual', ['AttributeTypeName' => ['Value' => 'MultiSelectPicklistType']]),
            $this->attribute('custom_date', 'DateTime'),
            $this->attribute('custom_time', 'DateTime'),
            $this->attribute('custom_independent', 'DateTime'),
            $this->attribute('custom_lookup', 'Lookup'),
            $this->attribute('readonly', 'String', ['IsValidForCreate' => false]),
            $this->attribute('derived', 'String', ['AttributeOf' => 'custom_score']),
            $this->attribute('logical', 'String', ['IsLogical' => true]),
            $this->attribute('statecode', 'State'),
            $this->attribute('revenue', 'Money'),
        ];
        $client = $this->client([
            $this->metadata($attributes),
            $this->metadata([['LogicalName' => 'leadsourcecode', 'OptionSet' => ['Options' => [['Value' => 0, 'Label' => ['UserLocalizedLabel' => ['Label' => 'Website']]]]]]]),
            $this->metadata([['LogicalName' => 'custom_choices', 'GlobalOptionSet' => ['Options' => [['Value' => 42, 'Label' => ['LocalizedLabels' => [['Label' => 'News']]]]]]]]),
            $this->metadata([
                ['LogicalName' => 'custom_date', 'DateTimeBehavior' => ['Value' => 'DateOnly']],
                ['LogicalName' => 'custom_time', 'DateTimeBehavior' => ['Value' => 'UserLocal']],
                ['LogicalName' => 'custom_independent', 'DateTimeBehavior' => ['Value' => 'TimeZoneIndependent']],
            ]),
        ]);
        $fields = $this->integration()->fetchFields('lead', $client);
        self::assertSame(['lastname', 'custom_score', 'custom_decimal', 'donotemail', 'leadsourcecode', 'custom_choices', 'custom_date', 'custom_time'], array_map(static fn ($field) => $field->getHandle(), $fields));
        self::assertSame(['string', 'numeric', 'float', 'boolean', 'numeric', 'array', 'date', 'datetime'], array_map(static fn ($field) => $field->getType(), $fields));
        self::assertTrue($fields[0]->isRequired());
        self::assertSame('Website', $fields[4]->getOptions()->get(0)->label);
        self::assertSame(0, $fields[4]->getOptions()->get(0)->key);
        self::assertSame('News', $fields[5]->getOptions()->get(0)->label);
        self::assertCount(4, $this->history);
        self::assertSame("/api/data/v9.2/EntityDefinitions(LogicalName='lead')/Attributes", rawurldecode($this->history[0]['request']->getUri()->getPath()));
        parse_str($this->history[0]['request']->getUri()->getQuery(), $query);
        self::assertSame('IsValidForCreate eq true', $query['$filter']);
    }

    public function testInvalidMetadataDoesNotEraseCachedFieldsAsAnEmptyResult(): void
    {
        $this->expectException(IntegrationException::class);
        $this->integration()->fetchFields('contact', $this->client([new Response(200, [], '{}')]));
    }

    public function testSimpleContactDiscoveryAndMissingChoices(): void
    {
        $integration = $this->integration();
        $fields = $integration->fetchFields('contact', $this->client([$this->metadata([$this->attribute('custom_text', 'String')])]));
        self::assertCount(1, $this->history);
        self::assertSame('contact', $fields[0]->getCategory());

        $this->expectException(IntegrationException::class);
        $integration->fetchFields('lead', $this->client([
            $this->metadata([$this->attribute('choice', 'Picklist')]), $this->metadata([]),
        ]));
    }

    public function testUnknownCategoryIsRejectedBeforeSendingRequest(): void
    {
        $this->expectException(IntegrationException::class);

        try {
            $this->integration()->fetchFields("lead')/contacts", $this->client([]));
        } finally {
            self::assertSame([], $this->history);
        }
    }

    public function testPushUsesRealMappingPipelineAndPreservesTypedValues(): void
    {
        $fields = [
            new FieldObject('lastname', 'Last name', 'string', 'lead'),
            new FieldObject('score', 'Score', 'numeric', 'lead'),
            new FieldObject('amount', 'Amount', 'float', 'lead'),
            new FieldObject('zero', 'Zero', 'numeric', 'lead'),
            new FieldObject('donotemail', 'Do not email', 'boolean', 'lead'),
            new FieldObject('blank', 'Blank', 'string', 'lead'),
            new FieldObject('choices', 'Choices', 'array', 'lead', false, [['key' => 0, 'label' => 'Zero'], ['key' => 42, 'label' => 'News']]),
        ];
        $mapping = new FieldMapping();
        foreach ($fields as $field) {
            $mapping->add($field->getHandle(), FieldMapItem::TYPE_RELATION, $field->getHandle());
        }
        $integration = $this->integration(['mapLeads' => true, 'leadMapping' => $mapping, 'mapContacts' => true, 'contactMapping' => (new FieldMapping())->add('lastname', FieldMapItem::TYPE_PRESET, 'Customer')], $fields);
        $form = $this->form(['lastname' => ' Test ', 'score' => '-7', 'amount' => '-1.25', 'zero' => '0', 'donotemail' => 'false', 'blank' => '', 'choices' => ['0', '42']]);
        $client = $this->client([new Response(204), new Response(201, [], '{}')]);
        $integration->push($form, $client);
        self::assertCount(2, $this->history);
        self::assertSame(['lastname' => 'Test', 'score' => -7, 'amount' => -1.25, 'zero' => 0, 'donotemail' => false, 'choices' => '0,42'], json_decode((string) $this->history[0]['request']->getBody(), true));
        self::assertSame('/api/data/v9.2/leads', $this->history[0]['request']->getUri()->getPath());
        self::assertSame('/api/data/v9.2/contacts', $this->history[1]['request']->getUri()->getPath());
        self::assertSame('false', $this->history[0]['request']->getHeaderLine('MSCRM.SuppressDuplicateDetection'));
        self::assertSame('POST', $this->history[0]['request']->getMethod());
    }

    public function testInvalidSecondMappingDoesNotWriteFirstRecord(): void
    {
        $fields = [new FieldObject('name', 'Name', 'string', 'lead'), new FieldObject('number', 'Number', 'numeric', 'contact')];
        $integration = $this->integration([
            'mapLeads' => true, 'leadMapping' => (new FieldMapping())->add('name', FieldMapItem::TYPE_PRESET, 'Test'),
            'mapContacts' => true, 'contactMapping' => (new FieldMapping())->add('number', FieldMapItem::TYPE_PRESET, 'not a number'),
        ], $fields);
        $this->expectException(IntegrationException::class);

        try {
            $integration->push($this->form([]), $this->client([]));
        } finally {
            self::assertSame([], $this->history);
        }
    }

    #[DataProvider('skipProvider')]
    public function testUnconfiguredOrEmptyCategoriesDoNotCreateRecords(array $properties): void
    {
        $this->integration($properties, [new FieldObject('name', 'Name', 'string', 'lead')])->push($this->form([]), $this->client([]));
        self::assertSame([], $this->history);
    }

    public static function skipProvider(): iterable
    {
        yield 'disabled' => [[]];

        yield 'no mapping' => [['mapLeads' => true]];

        yield 'blank mapping' => [['mapLeads' => true, 'leadMapping' => (new FieldMapping())->add('name', FieldMapItem::TYPE_PRESET, '')]];
    }

    #[DataProvider('errorStatusProvider')]
    public function testWriteFailuresPropagateWithoutAutomaticRetry(int $status): void
    {
        $integration = $this->integration(['mapContacts' => true, 'contactMapping' => (new FieldMapping())->add('lastname', FieldMapItem::TYPE_PRESET, 'Test')], [new FieldObject('lastname', 'Last name', 'string', 'contact')]);
        $client = $this->client([new Response($status, ['Retry-After' => '30'], '{"error":{"code":"test","message":"Request rejected"}}')]);
        $this->expectException(RequestException::class);

        try {
            $integration->push($this->form([]), $client);
        } finally {
            self::assertCount(1, $this->history);
        }
    }

    public static function errorStatusProvider(): iterable
    {
        yield 'validation' => [400];

        yield 'unauthorized' => [401];

        yield 'permission' => [403];

        yield 'rate limit' => [429];

        yield 'duplicate or server error' => [500];
    }

    #[DataProvider('conversionProvider')]
    public function testConvertsApiValues(string $type, mixed $value, mixed $expected): void
    {
        self::assertSame($expected, MicrosoftDynamicsValueConverter::convert(new FieldObject('test', 'Test', $type, 'lead'), $value));
    }

    public static function conversionProvider(): iterable
    {
        yield 'zero' => ['numeric', '0', 0];

        yield 'integral float from number field' => ['numeric', 5.0, 5];

        yield 'negative integer' => ['numeric', '-7', -7];

        yield 'negative decimal' => ['float', '-97.1384', -97.1384];

        yield 'false string' => ['boolean', 'false', false];

        yield 'no' => ['boolean', 'no', false];

        yield 'zero boolean' => ['boolean', '0', false];

        yield 'yes' => ['boolean', 'yes', true];

        yield 'unchecked' => ['boolean', [], false];

        yield 'checked list' => ['boolean', ['yes'], true];

        yield 'blank number' => ['numeric', '', null];

        yield 'date only' => ['date', '2024-02-29', '2024-02-29T00:00:00Z'];

        yield 'offset retained' => ['datetime', '2026-09-16T14:30:00-05:00', '2026-09-16T14:30:00-05:00'];

        yield 'fractional timestamp preserved' => ['datetime', '2026-09-16T14:30:00.123Z', '2026-09-16T14:30:00.123Z'];

        yield 'choices list' => ['array', ['0', '42', '42'], '0,42'];

        yield 'choices string' => ['array', '0, 42', '0,42'];

        yield 'text list' => ['string', ['one', 'two'], 'one, two'];
    }

    #[DataProvider('invalidConversionProvider')]
    public function testRejectsInvalidValuesInsteadOfSilentlyCoercingThem(string $type, mixed $value): void
    {
        $this->expectException(IntegrationException::class);
        MicrosoftDynamicsValueConverter::convert(new FieldObject('test', 'Test', $type, 'lead'), $value);
    }

    public static function invalidConversionProvider(): iterable
    {
        yield 'decimal integer' => ['numeric', '1.5'];

        yield 'fractional number field' => ['numeric', 1.5];

        yield 'nonnumeric' => ['numeric', 'abc'];

        yield 'boolean numeric' => ['numeric', true];

        yield 'localized decimal' => ['float', '1,234.56'];

        yield 'nonfinite decimal' => ['float', \INF];

        yield 'invalid boolean' => ['boolean', 'maybe'];

        yield 'impossible date' => ['date', '2026-02-30'];

        yield 'ambiguous date' => ['date', '09/16/2026'];

        yield 'missing timezone' => ['datetime', '2026-09-16T14:30:00'];

        yield 'normalized invalid datetime' => ['datetime', '2026-02-30T14:30:00Z'];

        yield 'choice labels' => ['array', 'News, Events'];

        yield 'nested text' => ['string', [['not text']]];
    }

    public function testUnknownChoiceIsRejected(): void
    {
        $this->expectException(IntegrationException::class);
        MicrosoftDynamicsValueConverter::convert(new FieldObject('choice', 'Choice', 'numeric', 'lead', false, [['key' => 0, 'label' => 'Website']]), '99');
    }

    public function testCheckboxUsesCheckedStateEvenWithACustomValue(): void
    {
        $field = new FieldObject('boolean', 'Boolean', 'boolean', 'lead');
        $checked = $this->createConfiguredMock(CheckboxField::class, ['isChecked' => true]);
        $unchecked = $this->createConfiguredMock(CheckboxField::class, ['isChecked' => false]);
        self::assertTrue(MicrosoftDynamicsValueConverter::convert($field, 'I agree', $checked));
        self::assertFalse(MicrosoftDynamicsValueConverter::convert($field, '', $unchecked));
    }

    private function integration(array $properties = [], ?array $fields = null): MicrosoftDynamics
    {
        $arguments = [1, 2, 'integration-uid', 'instance-uid', true, false, 'dynamics', 'Dynamics', new Type('Microsoft Dynamics 365', Type::TYPE_CRM), new NullLogger()];
        if (null === $fields) {
            $integration = new MicrosoftDynamics(...$arguments);
        } else {
            $integration = $this->getMockBuilder(MicrosoftDynamics::class)->setConstructorArgs($arguments)->onlyMethods(['getProcessableFields'])->getMock();
            $indexed = [];
            foreach ($fields as $field) {
                $indexed[$field->getHandle()] = $field;
            }
            $integration->method('getProcessableFields')->willReturn($indexed);
        }
        $properties += ['environmentUrl' => 'https://example.crm4.dynamics.com', 'tenantId' => '11111111-1111-1111-1111-111111111111', 'clientId' => '22222222-2222-2222-2222-222222222222', 'clientSecret' => 'test-secret'];
        foreach ($properties as $key => $value) {
            (new \ReflectionProperty($integration, $key))->setValue($integration, $value);
        }

        return $integration;
    }

    private function client(array $responses, array $config = []): Client
    {
        $stack = HandlerStack::create(new MockHandler($responses));
        $stack->push(Middleware::history($this->history));

        return new Client(array_merge($config, ['handler' => $stack]));
    }

    private function token(string $token, int $expires = 3600): Response
    {
        return new Response(200, [], json_encode(['access_token' => $token, 'token_type' => 'Bearer', 'expires_in' => $expires]));
    }

    private function metadata(array $attributes): Response
    {
        return new Response(200, [], json_encode(['value' => $attributes]));
    }

    private function attribute(string $name, string $type, array $overrides = []): array
    {
        return $overrides + ['LogicalName' => $name, 'AttributeType' => $type, 'IsValidForCreate' => true, 'DisplayName' => ['UserLocalizedLabel' => ['Label' => $name]]];
    }

    private function form(array $values): Form
    {
        $fields = [];
        foreach ($values as $uid => $value) {
            $fields[$uid] = $this->createConfiguredMock(FieldInterface::class, ['getUid' => $uid, 'getValue' => $value]);
        }
        $form = $this->createMock(Form::class);
        $form->method('get')->willReturnCallback(static fn ($uid) => $fields[$uid] ?? null);

        return $form;
    }
}
