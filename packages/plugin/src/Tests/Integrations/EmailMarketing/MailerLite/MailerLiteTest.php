<?php

namespace Solspace\Freeform\Tests\Integrations\EmailMarketing\MailerLite;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use GuzzleHttp\Handler\MockHandler;
use GuzzleHttp\HandlerStack;
use GuzzleHttp\Middleware;
use GuzzleHttp\Psr7\Response;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;
use Psr\Log\NullLogger;
use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Attributes\Property\Implementations\FieldMapping\FieldMapItem;
use Solspace\Freeform\Attributes\Property\Implementations\FieldMapping\FieldMapping;
use Solspace\Freeform\Bundles\Integrations\IntegrationsBundle;
use Solspace\Freeform\Events\Integrations\GetAuthorizedClientEvent;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Integrations\EmailMarketing\MailerLite\MailerLite;
use Solspace\Freeform\Integrations\EmailMarketing\MailerLite\MailerLiteBundle;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;
use Solspace\Freeform\Library\Integrations\APIIntegrationInterface;
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;
use Solspace\Freeform\Library\Integrations\Types\EmailMarketing\DataObjects\ListObject;
use yii\base\Event;

#[CoversClass(MailerLite::class)]
#[CoversClass(MailerLiteBundle::class)]
class MailerLiteTest extends TestCase
{
    private array $history = [];
    private IntegrationsBundle $valueProcessor;

    protected function setUp(): void
    {
        parent::setUp();

        $this->history = [];
        $this->valueProcessor = (new \ReflectionClass(IntegrationsBundle::class))->newInstanceWithoutConstructor();
        Event::on(APIIntegrationInterface::class, APIIntegrationInterface::EVENT_PROCESS_VALUE, [$this->valueProcessor, 'processValue']);
    }

    protected function tearDown(): void
    {
        Event::off(APIIntegrationInterface::class, APIIntegrationInterface::EVENT_PROCESS_VALUE, [$this->valueProcessor, 'processValue']);

        parent::tearDown();
    }

    public function testClientAuthenticatesAgainstCurrentApi(): void
    {
        $integration = $this->getMockBuilder(MailerLite::class)
            ->disableOriginalConstructor()
            ->onlyMethods(['getApiKey'])
            ->getMock()
        ;
        $integration->method('getApiKey')->willReturn('test-token');
        $event = new GetAuthorizedClientEvent($integration);
        $bundle = (new \ReflectionClass(MailerLiteBundle::class))->newInstanceWithoutConstructor();
        $bundle->configureClient($event);
        $client = $this->createClient([new Response(200, [], '{"data":[]}')], $event->getConfig());

        self::assertTrue($integration->checkConnection($client));
        $request = $this->history[0]['request'];
        self::assertSame('https://connect.mailerlite.com/api/groups?limit=1', (string) $request->getUri());
        self::assertSame('Bearer test-token', $request->getHeaderLine('Authorization'));
        self::assertSame('application/json', $request->getHeaderLine('Accept'));
        self::assertSame('application/json', $request->getHeaderLine('Content-Type'));
        self::assertSame('2026-09-17', $request->getHeaderLine('X-Version'));
        self::assertFalse($client->getConfig('allow_redirects'));
    }

    public function testFetchesEveryGroupPageAndPreservesLargeIds(): void
    {
        $client = $this->createClient([
            $this->collectionResponse([['id' => '12345678901234567890', 'name' => 'Newsletter', 'active_count' => 42]], 1, 2),
            $this->collectionResponse([['id' => '2', 'name' => 'Customers']], 2, 2),
        ]);

        $lists = $this->createIntegration()->fetchLists($client);

        self::assertCount(2, $lists);
        self::assertSame('12345678901234567890', $lists[0]->getResourceId());
        self::assertSame(42, $lists[0]->getMemberCount());
        self::assertSame('Customers', $lists[1]->getName());
        self::assertSame('limit=100&page=2', $this->history[1]['request']->getUri()->getQuery());
        self::assertSame('connect.mailerlite.com', $this->history[1]['request']->getUri()->getHost());
    }

    public function testFetchesStandardAndCustomFieldsAcrossPages(): void
    {
        $client = $this->createClient([
            $this->collectionResponse([['key' => 'name', 'name' => 'Name', 'type' => 'text']], 1, 2),
            $this->collectionResponse([
                ['key' => 'balance', 'name' => 'Balance', 'type' => 'number'],
                ['key' => 'birthday', 'name' => 'Birthday', 'type' => 'date'],
                ['key' => 'unsupported', 'name' => 'Unsupported', 'type' => 'object'],
            ], 2, 2),
        ]);

        $fields = $this->createIntegration()->fetchFields(new ListObject('1', 'Newsletter'), MailerLite::CATEGORY_SUBSCRIBER, $client);

        self::assertSame(['name', 'balance', 'birthday'], array_map(static fn ($field) => $field->getHandle(), $fields));
        self::assertSame([FieldObject::TYPE_STRING, FieldObject::TYPE_STRING, FieldObject::TYPE_DATE], array_map(static fn ($field) => $field->getType(), $fields));
        self::assertSame('/api/fields', $this->history[1]['request']->getUri()->getPath());
    }

    public function testEmptyAccountAndUnknownCategory(): void
    {
        $integration = $this->createIntegration();
        $client = $this->createClient([$this->collectionResponse([])]);

        self::assertSame([], $integration->fetchLists($client));
        self::assertSame([], $integration->fetchFields(new ListObject('1', 'Newsletter'), 'unknown', $client));
        self::assertCount(1, $this->history);
    }

    #[DataProvider('invalidCollectionProvider')]
    public function testMalformedCollectionsFailInsteadOfSilentlyLosingGroups(array $body): void
    {
        $client = $this->createClient([new Response(200, [], json_encode($body))]);

        $this->expectException(IntegrationException::class);
        $this->createIntegration()->fetchLists($client);
    }

    public static function invalidCollectionProvider(): iterable
    {
        yield 'missing collection' => [[]];

        yield 'missing pagination' => [['data' => []]];

        yield 'wrong current page' => [['data' => [], 'meta' => ['current_page' => 2, 'last_page' => 2]]];

        yield 'empty intermediate page' => [['data' => [], 'meta' => ['current_page' => 1, 'last_page' => 2]]];

        yield 'invalid last page' => [['data' => [], 'meta' => ['current_page' => 1, 'last_page' => 'bad']]];

        yield 'invalid group' => [['data' => [['id' => '1']], 'meta' => ['current_page' => 1, 'last_page' => 1]]];
    }

    #[DataProvider('subscriberResponseProvider')]
    public function testUpsertsSubscribersWithoutOverridingStatusOrReplacingGroups(int $status, string $subscriberStatus): void
    {
        $integration = $this->createIntegration([
            'fieldMapping' => (new FieldMapping())
                ->add('name', FieldMapItem::TYPE_RELATION, 'name')
                ->add('balance', FieldMapItem::TYPE_RELATION, 'balance')
                ->add('count', FieldMapItem::TYPE_RELATION, 'count')
                ->add('interests', FieldMapItem::TYPE_RELATION, 'interests')
                ->add('blank', FieldMapItem::TYPE_RELATION, 'blank')
                ->add('missing', FieldMapItem::TYPE_RELATION, 'missing')
                ->add('unknown', FieldMapItem::TYPE_PRESET, 'ignored'),
        ], ['name', 'balance', 'count', 'interests', 'blank', 'missing']);
        $client = $this->createClient([new Response($status, [], json_encode(['data' => ['id' => '123', 'status' => $subscriberStatus]]))]);

        $integration->push($this->createForm([
            'email' => ' subscriber@example.com ',
            'name' => ' Sarah ',
            'balance' => '-12.50',
            'count' => 0,
            'interests' => ['News', 'Events'],
            'blank' => '  ',
        ]), $client);

        self::assertCount(1, $this->history);
        $request = $this->history[0]['request'];
        self::assertSame('POST', $request->getMethod());
        self::assertSame('https://connect.mailerlite.com/api/subscribers', (string) $request->getUri());
        self::assertSame([
            'email' => 'subscriber@example.com',
            'groups' => ['12345678901234567890'],
            'fields' => ['name' => 'Sarah', 'balance' => '-12.50', 'count' => '0', 'interests' => 'News, Events'],
        ], json_decode((string) $request->getBody(), true));
    }

    public static function subscriberResponseProvider(): iterable
    {
        yield 'new subscriber' => [201, 'active'];

        yield 'existing subscriber' => [200, 'active'];

        yield 'awaiting confirmation' => [201, 'unconfirmed'];

        yield 'unsubscribed subscriber' => [200, 'unsubscribed'];
    }

    #[DataProvider('skipProvider')]
    public function testSkipsRequestsForMissingConfigurationOrUncheckedOptIn(array $properties, array $values): void
    {
        $this->createIntegration($properties)->push($this->createForm($values), $this->createClient([]));

        self::assertSame([], $this->history);
    }

    public static function skipProvider(): iterable
    {
        yield 'no group' => [['mailingList' => null], ['email' => 'subscriber@example.com']];

        yield 'empty group ID' => [['mailingList' => new ListObject('', 'Newsletter')], ['email' => 'subscriber@example.com']];

        yield 'no selected email field' => [['emailField' => null], ['email' => 'subscriber@example.com']];

        yield 'missing email field' => [[], []];

        yield 'blank email' => [[], ['email' => " \t "]];

        yield 'unchecked opt-in' => [['optInField' => 'optIn'], ['email' => 'subscriber@example.com', 'optIn' => false]];

        yield 'missing opt-in field' => [['optInField' => 'optIn'], ['email' => 'subscriber@example.com']];
    }

    public function testCheckedOptInSendsSubscriberWithoutEmptyFields(): void
    {
        $client = $this->createClient([new Response(201, [], '{"data":{"id":"123"}}')]);
        $this->createIntegration(['optInField' => 'optIn'])->push($this->createForm(['email' => 'subscriber@example.com', 'optIn' => true]), $client);

        self::assertCount(1, $this->history);
        self::assertArrayNotHasKey('fields', json_decode((string) $this->history[0]['request']->getBody(), true));
    }

    public function testDateMappingsPreserveIsoDatesAndSkipWhitespace(): void
    {
        $integration = $this->createIntegration([
            'fieldMapping' => (new FieldMapping())
                ->add('birthday', FieldMapItem::TYPE_PRESET, '2000-02-29')
                ->add('blank_date', FieldMapItem::TYPE_PRESET, '  '),
        ], [
            new FieldObject('birthday', 'Birthday', FieldObject::TYPE_DATE, MailerLite::CATEGORY_SUBSCRIBER),
            new FieldObject('blank_date', 'Blank date', FieldObject::TYPE_DATE, MailerLite::CATEGORY_SUBSCRIBER),
        ]);
        $client = $this->createClient([new Response(201, [], '{"data":{"id":"123"}}')]);

        $integration->push($this->createForm(['email' => 'subscriber@example.com']), $client);

        self::assertSame(['birthday' => '2000-02-29'], json_decode((string) $this->history[0]['request']->getBody(), true)['fields']);
    }

    #[DataProvider('apiErrorProvider')]
    public function testApiErrorsReachFreeformsErrorHandling(int $status): void
    {
        $client = $this->createClient([new Response($status, ['Retry-After' => '60'], '{"message":"Request failed"}')]);

        $this->expectException(RequestException::class);
        $this->createIntegration()->push($this->createForm(['email' => 'subscriber@example.com']), $client);
    }

    public static function apiErrorProvider(): iterable
    {
        yield 'invalid credentials' => [401];

        yield 'invalid fields' => [422];

        yield 'rate limited' => [429];

        yield 'provider unavailable' => [503];
    }

    #[DataProvider('invalidSubscriberProvider')]
    public function testUnexpectedResponsesAreNotReportedAsSuccess(int $status, string $body): void
    {
        $client = $this->createClient([new Response($status, [], $body)]);

        $this->expectException(IntegrationException::class);
        $this->createIntegration()->push($this->createForm(['email' => 'subscriber@example.com']), $client);
    }

    public static function invalidSubscriberProvider(): iterable
    {
        yield 'unexpected status' => [204, ''];

        yield 'missing subscriber ID' => [200, '{"data":{}}'];
    }

    private function createIntegration(array $properties = [], array $fieldNames = []): MailerLite
    {
        // Field discovery is tested separately; stand in for Freeform's database field cache.
        $integration = $this->getMockBuilder(MailerLite::class)
            ->setConstructorArgs([1, 2, 'integration-uid', 'instance-uid', true, false, 'mailerlite', 'MailerLite', new Type('MailerLite', Type::TYPE_EMAIL_MARKETING), new NullLogger()])
            ->onlyMethods(['getProcessableFields'])
            ->getMock()
        ;
        $fields = [];
        foreach ($fieldNames as $name) {
            $field = $name instanceof FieldObject ? $name : new FieldObject($name, $name, FieldObject::TYPE_STRING, MailerLite::CATEGORY_SUBSCRIBER);
            $fields[$field->getHandle()] = $field;
        }

        $integration->method('getProcessableFields')->willReturn($fields);
        $properties += ['mailingList' => new ListObject('12345678901234567890', 'Newsletter'), 'emailField' => 'email'];
        foreach ($properties as $name => $value) {
            if (\in_array($name, ['emailField', 'optInField'], true) && \is_string($value)) {
                $value = $this->createConfiguredMock(FieldInterface::class, ['getUid' => $value]);
            }

            $property = new \ReflectionProperty(MailerLite::class, $name);
            $property->setAccessible(true);
            $property->setValue($integration, $value);
        }

        return $integration;
    }

    private function createForm(array $values): Form
    {
        $fields = [];
        foreach ($values as $uid => $value) {
            $fields[$uid] = $this->createConfiguredMock(FieldInterface::class, ['getUid' => $uid, 'getValue' => $value]);
        }

        $form = $this->createMock(Form::class);
        $form->method('get')->willReturnCallback(static fn ($uid) => $fields[$uid] ?? null);

        return $form;
    }

    private function createClient(array $responses, array $config = []): Client
    {
        $stack = HandlerStack::create(new MockHandler($responses));
        $stack->push(Middleware::history($this->history));

        return new Client(array_merge($config, ['handler' => $stack]));
    }

    private function collectionResponse(array $data, int $page = 1, int $lastPage = 1): Response
    {
        return new Response(200, [], json_encode([
            'data' => $data,
            'meta' => ['current_page' => $page, 'last_page' => $lastPage],
        ]));
    }
}
