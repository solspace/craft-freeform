<?php

namespace Solspace\Freeform\Tests\Integrations\Other\Supabase;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\ConnectException;
use GuzzleHttp\Handler\MockHandler;
use GuzzleHttp\Middleware;
use GuzzleHttp\Psr7\Request;
use GuzzleHttp\Psr7\Response;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;
use Psr\Log\NullLogger;
use Solspace\Freeform\Attributes\Property\Implementations\FieldMapping\FieldMapItem;
use Solspace\Freeform\Attributes\Property\Implementations\FieldMapping\FieldMapping;
use Solspace\Freeform\Bundles\Attributes\Property\PropertyProvider;
use Solspace\Freeform\Bundles\Fields\ImplementationProvider;
use Solspace\Freeform\Bundles\Form\Limiting\LimitedUsers\LimitedUserChecker;
use Solspace\Freeform\Bundles\Integrations\IntegrationsBundle;
use Solspace\Freeform\Bundles\Integrations\Providers\IntegrationDTOProvider;
use Solspace\Freeform\Bundles\Integrations\Providers\IntegrationTypeProvider;
use Solspace\Freeform\Bundles\Settings\DefaultsProvider;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\Integrations\GetAuthorizedClientEvent;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Implementations\CheckboxField;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Integrations\Other\Supabase\Supabase;
use Solspace\Freeform\Integrations\Other\Supabase\SupabaseBundle;
use Solspace\Freeform\Integrations\Other\Supabase\SupabaseSchema;
use Solspace\Freeform\Integrations\Other\Supabase\SupabaseValueConverter;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;
use Solspace\Freeform\Library\Helpers\EditionHelper;
use Solspace\Freeform\Library\Integrations\APIIntegrationInterface;
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;
use Solspace\Freeform\Library\Integrations\IntegrationInterface;
use Solspace\Freeform\Library\Integrations\Transformers\IntegrationRuleTransformer;
use yii\base\Event;
use yii\di\Container;

#[CoversClass(Supabase::class)]
#[CoversClass(SupabaseBundle::class)]
#[CoversClass(SupabaseSchema::class)]
#[CoversClass(SupabaseValueConverter::class)]
class SupabaseTest extends TestCase
{
    private array $history = [];
    private SupabaseBundle $bundle;
    private IntegrationsBundle $genericProcessor;

    protected function setUp(): void
    {
        $this->history = [];
        $this->bundle = (new \ReflectionClass(SupabaseBundle::class))->newInstanceWithoutConstructor();
        $this->genericProcessor = (new \ReflectionClass(IntegrationsBundle::class))->newInstanceWithoutConstructor();
        Event::on(Supabase::class, Supabase::EVENT_PROCESS_VALUE, [$this->bundle, 'processValue']);
        Event::on(APIIntegrationInterface::class, APIIntegrationInterface::EVENT_PROCESS_VALUE, [$this->genericProcessor, 'processValue']);
    }

    protected function tearDown(): void
    {
        Event::off(Supabase::class, Supabase::EVENT_PROCESS_VALUE, [$this->bundle, 'processValue']);
        Event::off(APIIntegrationInterface::class, APIIntegrationInterface::EVENT_PROCESS_VALUE, [$this->genericProcessor, 'processValue']);
    }

    public function testBuilderReceivesTableAndMappingControlsWithoutGlobalCredentials(): void
    {
        $previousContainer = \Craft::$container;
        \Craft::$container = new Container();
        \Craft::$container->set(IntegrationRuleTransformer::class, $this->createMock(IntegrationRuleTransformer::class));

        try {
            $provider = $this->getMockBuilder(PropertyProvider::class)->setConstructorArgs([
                $this->createMock(ImplementationProvider::class),
                $this->createMock(DefaultsProvider::class),
                $this->createMock(LimitedUserChecker::class),
            ])->onlyMethods(['getPluginEdition'])->getMock();
            $provider->method('getPluginEdition')->willReturn(new EditionHelper('pro', ['express', 'lite', 'pro']));
            $integration = $this->integration();
            $settings = $provider->getEditableProperties($integration);
            self::assertTrue($settings->get('apiKey')->hasFlag(IntegrationInterface::FLAG_ENCRYPTED));
            self::assertTrue($settings->get('apiKey')->hasFlag(IntegrationInterface::FLAG_ENV_SUGGEST));
            self::assertSame('dynamicSelect', $settings->get('table')->type);
            self::assertSame(['id' => 'integrationId', 'values.table' => 'table'], $settings->get('fieldMapping')->parameterFields);
            $dto = (new IntegrationDTOProvider($provider))->convert([$integration])[0];
            self::assertSame('other', $dto->type);
            self::assertNull($dto->properties->get('apiKey'));
            self::assertNull($dto->properties->get('projectUrl'));
            self::assertNull($dto->properties->get('schema'));
            self::assertNotNull($dto->properties->get('table'));
            self::assertNotNull($dto->properties->get('fieldMapping'));
        } finally {
            \Craft::$container = $previousContainer;
        }
    }

    public function testDiscoversOnlyInsertableTablesAndTypedColumnsWithoutReadingRows(): void
    {
        $integration = $this->integration();
        $client = $this->client([$this->metadata(), $this->metadata(), $this->metadata()], $integration);
        self::assertTrue($integration->checkConnection($client));
        self::assertSame(['leads'], $integration->fetchTables($client));
        $fields = $integration->fetchFields('public.leads', $client);
        self::assertSame(['id', 'name', 'score', 'amount', 'active', 'birthday', 'created_at', 'tags', 'answers', 'status'], array_map(static fn ($field) => $field->getHandle(), $fields));
        self::assertSame(['numeric', 'string', 'numeric', 'float', 'boolean', 'date', 'datetime', 'array', 'supabase-json', 'string'], array_map(static fn ($field) => $field->getType(), $fields));
        self::assertFalse($fields[0]->isRequired());
        self::assertTrue($fields[1]->isRequired());
        self::assertFalse($fields[6]->isRequired());
        self::assertSame('new', $fields[9]->getOptions()->get(0)->key);
        foreach ($this->history as $entry) {
            $request = $entry['request'];
            self::assertSame('GET', $request->getMethod());
            self::assertSame('https://example.supabase.co/rest/v1/', (string) $request->getUri());
            self::assertSame('application/openapi+json', $request->getHeaderLine('Accept'));
            self::assertSame('sb_secret_test-key', $request->getHeaderLine('apikey'));
            self::assertSame('public', $request->getHeaderLine('Accept-Profile'));
            self::assertFalse($request->hasHeader('Authorization'));
            self::assertFalse($entry['options']['allow_redirects']);
        }
    }

    public function testLegacyServiceRoleKeyUsesApiKeyAndBearerHeaders(): void
    {
        $key = self::legacyKey('service_role');
        $integration = $this->integration(['apiKey' => $key, 'schema' => 'forms']);
        $integration->checkConnection($this->client([$this->metadata()], $integration));
        $request = $this->history[0]['request'];
        self::assertSame($key, $request->getHeaderLine('apikey'));
        self::assertSame('Bearer '.$key, $request->getHeaderLine('Authorization'));
        self::assertSame('forms', $request->getHeaderLine('Accept-Profile'));
        self::assertSame('forms.leads', $integration->getFieldCategory('leads'));
    }

    public function testUrlAndEnvironmentValuesAreNormalized(): void
    {
        putenv('FREEFORM_SUPABASE_TEST_URL=https://Custom.Example.com:8443/');
        putenv('FREEFORM_SUPABASE_TEST_KEY=sb_secret_env-key');

        try {
            $integration = $this->integration(['projectUrl' => '$FREEFORM_SUPABASE_TEST_URL', 'apiKey' => '$FREEFORM_SUPABASE_TEST_KEY']);
            self::assertSame('https://custom.example.com:8443/rest/v1', $integration->getApiRootUrl());
            self::assertSame('sb_secret_env-key', $integration->getApiKey());
        } finally {
            putenv('FREEFORM_SUPABASE_TEST_URL');
            putenv('FREEFORM_SUPABASE_TEST_KEY');
        }
    }

    #[DataProvider('invalidSettings')]
    public function testInvalidSettingsFailBeforeAnyRequest(array $properties): void
    {
        $this->expectException(IntegrationException::class);
        $this->integration($properties)->onBeforeSave();
    }

    public static function invalidSettings(): iterable
    {
        foreach (['http://example.supabase.co', 'https://user@example.supabase.co', 'https://example.supabase.co/rest/v1', 'https://example.supabase.co?key=x', 'https://example.supabase.co#x', 'not a URL'] as $url) {
            yield $url => [['projectUrl' => $url]];
        }

        yield 'public key' => [['apiKey' => 'sb_publishable_key']];

        yield 'anon key' => [['apiKey' => self::legacyKey('anon')]];

        yield 'missing key' => [['apiKey' => '']];

        yield 'header injection' => [['apiKey' => "sb_secret_key\r\nX-Test: value"]];

        yield 'bad schema' => [['schema' => 'public,auth']];
    }

    public function testMetadataErrorsDoNotBecomeEmptyFieldLists(): void
    {
        $integration = $this->integration();
        $this->expectException(IntegrationException::class);
        $integration->fetchFields('public.leads', $this->client([new Response(200, [], '{}')], $integration));
    }

    #[DataProvider('invalidCategories')]
    public function testUnknownSchemasAndTablesAreRejected(string $category): void
    {
        $integration = $this->integration();
        $this->expectException(IntegrationException::class);
        $integration->fetchFields($category, $this->client([$this->metadata()], $integration));
    }

    public static function invalidCategories(): iterable
    {
        yield ['auth.users'];

        yield ['public.rpc/function'];

        yield ['public.read_only'];

        yield ['public.missing'];
    }

    public function testClientRefusesToSendKeysOutsideTheConfiguredApi(): void
    {
        $integration = $this->integration();
        $client = $this->client([], $integration);
        $this->expectException(IntegrationException::class);

        try {
            $client->get('https://other.example.com/rest/v1/leads');
        } finally {
            self::assertSame([], $this->history);
        }
    }

    public function testClientRefusesOtherServicesOnTheSameHost(): void
    {
        $integration = $this->integration();
        $this->expectException(IntegrationException::class);
        $this->client([], $integration)->get('https://example.supabase.co/auth/v1/users');
    }

    public function testPushUsesMappingPipelineAndPreservesFalseZeroDecimalsAndStructuredData(): void
    {
        $fields = SupabaseSchema::fields($this->document(), 'leads', 'public.leads');
        $mapping = new FieldMapping();
        foreach ($fields as $field) {
            $mapping->add($field->getHandle(), FieldMapItem::TYPE_RELATION, $field->getHandle());
        }
        $integration = $this->integration(['table' => 'leads', 'fieldMapping' => $mapping], $fields);
        $form = $this->form(['name' => ' Test ', 'score' => '0', 'amount' => '-12.1234567890123456789', 'active' => 'false', 'tags' => ['one', 'two'], 'answers' => [['answer' => 0]], 'birthday' => '2024-02-29', 'status' => 'new', 'created_at' => '']);
        $integration->push($form, $this->client([new Response(201)], $integration));
        self::assertCount(1, $this->history);
        $request = $this->history[0]['request'];
        self::assertSame('POST', $request->getMethod());
        self::assertSame('/rest/v1/leads', $request->getUri()->getPath());
        self::assertSame('public', $request->getHeaderLine('Content-Profile'));
        self::assertSame('return=minimal', $request->getHeaderLine('Prefer'));
        self::assertSame(['name' => 'Test', 'score' => 0, 'amount' => '-12.1234567890123456789', 'active' => false, 'birthday' => '2024-02-29', 'tags' => ['one', 'two'], 'answers' => [['answer' => 0]], 'status' => 'new'], json_decode((string) $request->getBody(), true));
    }

    public function testOptionalDuplicatePreventionUsesSavedSubmissionUidWithoutUpdatingRows(): void
    {
        $integration = $this->mappedIntegration(['submissionUidColumn' => 'freeform_submission_uid']);
        $submission = $this->getMockBuilder(Submission::class)->disableOriginalConstructor()->onlyMethods(['getId'])->getMock();
        $submission->uid = '11111111-1111-4111-8111-111111111111';
        $form = $this->form([], $submission);
        $client = $this->client([new Response(201), new Response(201)], $integration);
        $integration->push($form, $client);
        $integration->push($form, $client);
        foreach ($this->history as $entry) {
            $request = $entry['request'];
            self::assertSame('on_conflict=freeform_submission_uid', $request->getUri()->getQuery());
            self::assertSame('return=minimal,resolution=ignore-duplicates', $request->getHeaderLine('Prefer'));
            self::assertSame($submission->uid, json_decode((string) $request->getBody(), true)['freeform_submission_uid']);
        }
    }

    public function testDuplicatePreventionWithoutSavedSubmissionDoesNotSendAnything(): void
    {
        $integration = $this->mappedIntegration(['submissionUidColumn' => 'freeform_submission_uid']);
        $this->expectException(IntegrationException::class);

        try {
            $integration->push($this->form([]), $this->client([], $integration));
        } finally {
            self::assertSame([], $this->history);
        }
    }

    public function testUnconfiguredOrEmptyMappingDoesNotCreateDefaultOnlyRows(): void
    {
        $integration = $this->integration();
        $integration->push($this->form([]), $this->client([], $integration));
        $integration = $this->mappedIntegration(['fieldMapping' => new FieldMapping()]);
        $integration->push($this->form([]), $this->client([], $integration));
        self::assertSame([], $this->history);
    }

    #[DataProvider('failedStatuses')]
    public function testHttpErrorsAreLoggedWithoutSecretsAndDoNotAutomaticallyRetry(int $status): void
    {
        $integration = $this->mappedIntegration();

        try {
            $integration->push($this->form([]), $this->client([new Response($status, [], '{"message":"sb_secret_test-key"}')], $integration));
            self::fail('Expected an integration error');
        } catch (IntegrationException $exception) {
            self::assertStringContainsString((string) $status, $exception->getMessage());
            self::assertStringNotContainsString('sb_secret_test-key', $exception->getMessage());
            self::assertNull($exception->getPrevious());
            self::assertCount(1, $this->history);
        }
    }

    public static function failedStatuses(): iterable
    {
        foreach ([301, 400, 401, 403, 404, 409, 429, 500] as $status) {
            yield [$status];
        }
    }

    public function testNetworkExceptionDoesNotRetainAuthenticatedRequest(): void
    {
        $integration = $this->mappedIntegration();
        $failure = new ConnectException('sb_secret_test-key', new Request('POST', 'https://example.supabase.co/rest/v1/leads', ['apikey' => 'sb_secret_test-key']));

        try {
            $integration->push($this->form([]), $this->client([$failure], $integration));
            self::fail('Expected a network failure');
        } catch (IntegrationException $exception) {
            self::assertNull($exception->getPrevious());
            self::assertStringNotContainsString('sb_secret_test-key', $exception->getMessage());
        }
    }

    #[DataProvider('validValues')]
    public function testValueConversions(string $type, mixed $value, mixed $expected): void
    {
        self::assertSame($expected, SupabaseValueConverter::convert(new FieldObject('column', 'Column', $type, 'public.leads'), $value));
    }

    public static function validValues(): iterable
    {
        yield ['numeric', '-7', -7];

        yield ['numeric', '0', 0];

        yield ['numeric', 5.0, 5];

        yield ['numeric', '9223372036854775808', '9223372036854775808'];

        yield ['float', '-123.0000000000000000001', '-123.0000000000000000001'];

        yield ['boolean', 'false', false];

        yield ['boolean', '0', false];

        yield ['boolean', [], false];

        yield ['boolean', ['checked'], true];

        yield ['array', '[0,false,"test"]', [0, false, 'test']];

        yield ['array', [], []];

        yield ['array', 'test', ['test']];

        yield ['supabase-json', '[]', []];

        yield ['supabase-json', 'false', false];

        yield ['supabase-json', [['nested' => ['answer' => 0]]], [['nested' => ['answer' => 0]]]];

        yield ['string', ['one', 'two'], 'one, two'];

        yield ['date', '2024-02-29', '2024-02-29'];

        yield ['datetime', '2026-10-02T14:30:00.123456-05:00', '2026-10-02T14:30:00.123456-05:00'];

        yield ['datetime', '2026-10-02T14:30:00', '2026-10-02T14:30:00'];

        yield ['numeric', '', null];
    }

    public function testJsonObjectsRetainTheirObjectShape(): void
    {
        $field = new FieldObject('answers', 'Answers', Supabase::TYPE_JSON, 'public.leads');
        self::assertSame('{}', json_encode(SupabaseValueConverter::convert($field, '{}')));
        self::assertSame('{"answer":0}', json_encode(SupabaseValueConverter::convert($field, '{"answer":0}')));
    }

    #[DataProvider('invalidValues')]
    public function testInvalidValuesFailInsteadOfSilentlyChangingData(string $type, mixed $value): void
    {
        $this->expectException(IntegrationException::class);
        SupabaseValueConverter::convert(new FieldObject('column', 'Column', $type, 'public.leads'), $value);
    }

    public static function invalidValues(): iterable
    {
        yield ['numeric', '1.5'];

        yield ['numeric', true];

        yield ['float', '1,234.56'];

        yield ['float', \INF];

        yield ['boolean', 'maybe'];

        yield ['array', [['nested']]];

        yield ['supabase-json', '{invalid}'];

        yield ['string', [['nested']]];

        yield ['date', '2026-02-30'];

        yield ['datetime', '2026-02-30T12:30:00Z'];
    }

    public function testCheckboxCustomValueUsesCheckedStateAndEnumsValidateOptions(): void
    {
        $field = new FieldObject('active', 'Active', 'boolean', 'public.leads');
        $checkbox = $this->createConfiguredMock(CheckboxField::class, ['isChecked' => true]);
        self::assertTrue(SupabaseValueConverter::convert($field, 'I agree', $checkbox));
        $enum = new FieldObject('status', 'Status', 'string', 'public.leads', false, [['key' => 'new', 'label' => 'New']]);
        self::assertSame('new', SupabaseValueConverter::convert($enum, 'new'));
        $this->expectException(IntegrationException::class);
        SupabaseValueConverter::convert($enum, 'missing');
    }

    private function mappedIntegration(array $properties = []): Supabase
    {
        return $this->integration($properties + ['table' => 'leads', 'fieldMapping' => (new FieldMapping())->add('name', FieldMapItem::TYPE_PRESET, 'Customer')], [new FieldObject('name', 'Name', 'string', 'public.leads')]);
    }

    private function integration(array $properties = [], ?array $fields = null): Supabase
    {
        $type = (new IntegrationTypeProvider())->getTypeDefinition(Supabase::class);
        $arguments = [1, 2, 'integration-uid', 'instance-uid', true, false, 'supabase', 'Supabase', $type, new NullLogger()];
        if (null === $fields) {
            $integration = new Supabase(...$arguments);
        } else {
            $integration = $this->getMockBuilder(Supabase::class)->setConstructorArgs($arguments)->onlyMethods(['getProcessableFields'])->getMock();
            $indexed = [];
            foreach ($fields as $field) {
                $indexed[$field->getHandle()] = $field;
            }
            $integration->method('getProcessableFields')->willReturn($indexed);
        }
        foreach ($properties + ['projectUrl' => 'https://example.supabase.co', 'apiKey' => 'sb_secret_test-key'] as $name => $value) {
            (new \ReflectionProperty($integration, $name))->setValue($integration, $value);
        }

        return $integration;
    }

    private function client(array $responses, Supabase $integration): Client
    {
        $event = new GetAuthorizedClientEvent($integration);
        $this->bundle->configureClient($event);
        $stack = $event->getStack();
        $stack->setHandler(new MockHandler($responses));
        $stack->push(Middleware::history($this->history));

        return new Client($event->getConfig() + ['handler' => $stack]);
    }

    private static function legacyKey(string $role): string
    {
        return 'eyJhbGciOiJIUzI1NiJ9.'.rtrim(strtr(base64_encode(json_encode(['role' => $role])), '+/', '-_'), '=').'.signature';
    }

    private function metadata(): Response
    {
        return new Response(200, ['Content-Type' => 'application/openapi+json'], json_encode($this->document()));
    }

    private function document(): array
    {
        return [
            'swagger' => '2.0',
            'paths' => ['/leads' => ['get' => [], 'post' => []], '/read_only' => ['get' => []], '/rpc/do_work' => ['post' => []]],
            'definitions' => [
                'leads' => ['required' => ['id', 'name', 'created_at'], 'properties' => [
                    'id' => ['type' => 'integer', 'format' => 'int64', 'description' => 'Note: This is a Primary Key.<pk/>'],
                    'name' => ['type' => 'string', 'format' => 'text'],
                    'score' => ['type' => 'integer', 'format' => 'int32'],
                    'amount' => ['type' => 'number', 'format' => 'numeric'],
                    'active' => ['type' => 'boolean', 'format' => 'boolean'],
                    'birthday' => ['type' => 'string', 'format' => 'date'],
                    'created_at' => ['type' => 'string', 'format' => 'timestamp with time zone', 'default' => 'now()'],
                    'tags' => ['type' => 'array', 'format' => 'text[]', 'items' => ['type' => 'string']],
                    'answers' => ['format' => 'jsonb'],
                    'status' => ['type' => 'string', 'format' => 'lead_status', 'enum' => ['new', 'reviewed']],
                    'calculated' => ['type' => 'integer', 'readOnly' => true],
                    'unsupported' => ['type' => 'object'],
                ]],
                'read_only' => ['properties' => ['name' => ['type' => 'string']]],
                'do_work' => ['properties' => ['value' => ['type' => 'string']]],
            ],
        ];
    }

    private function form(array $values, ?Submission $submission = null): Form
    {
        $fields = [];
        foreach ($values as $uid => $value) {
            $fields[$uid] = $this->createConfiguredMock(FieldInterface::class, ['getUid' => $uid, 'getValue' => $value]);
        }
        $form = $this->createMock(Form::class);
        $form->method('get')->willReturnCallback(static fn ($uid) => $fields[$uid] ?? null);
        $form->method('getSubmission')->willReturn($submission);

        return $form;
    }
}
