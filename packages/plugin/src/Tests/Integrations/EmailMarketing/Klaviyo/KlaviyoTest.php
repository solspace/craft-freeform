<?php

namespace Solspace\Freeform\Tests\Integrations\EmailMarketing\Klaviyo;

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
use Solspace\Freeform\Integrations\EmailMarketing\Klaviyo\Klaviyo;
use Solspace\Freeform\Integrations\EmailMarketing\Klaviyo\KlaviyoBundle;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;
use Solspace\Freeform\Library\Integrations\APIIntegrationInterface;
use Solspace\Freeform\Library\Integrations\Types\EmailMarketing\DataObjects\ListObject;
use yii\base\Event;

#[CoversClass(Klaviyo::class)]
#[CoversClass(KlaviyoBundle::class)]
class KlaviyoTest extends TestCase
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

    public function testClientUsesPrivateKeyAndApiRevision(): void
    {
        $integration = $this->getMockBuilder(Klaviyo::class)
            ->disableOriginalConstructor()
            ->onlyMethods(['getApiKey'])
            ->getMock()
        ;
        $integration->method('getApiKey')->willReturn('private-test-key');
        $event = new GetAuthorizedClientEvent($integration);
        $bundle = (new \ReflectionClass(KlaviyoBundle::class))->newInstanceWithoutConstructor();
        $bundle->configureClient($event);

        $client = $this->createClient([new Response(200, [], '{"data":[]}')], $event->getConfig());
        self::assertTrue($integration->checkConnection($client));

        $request = $this->history[0]['request'];
        self::assertSame('Klaviyo-API-Key private-test-key', $request->getHeaderLine('Authorization'));
        self::assertSame('2026-07-15', $request->getHeaderLine('revision'));
        self::assertSame('application/vnd.api+json', $request->getHeaderLine('Accept'));
        self::assertSame('application/vnd.api+json', $request->getHeaderLine('Content-Type'));
        self::assertFalse($client->getConfig('allow_redirects'));
        self::assertSame('/api/lists/', $request->getUri()->getPath());
        parse_str($request->getUri()->getQuery(), $query);
        self::assertSame('1', $query['page']['size']);
    }

    public function testListDiscoveryFollowsPagination(): void
    {
        $next = 'https://a.klaviyo.com/api/lists/?page%5Bcursor%5D=next-page';
        $client = $this->createClient([
            new Response(200, [], json_encode([
                'data' => [['id' => 'ListA', 'attributes' => ['name' => 'Newsletter']]],
                'links' => ['next' => $next],
            ])),
            new Response(200, [], json_encode([
                'data' => [['id' => 'ListB', 'attributes' => ['name' => 'Customers']]],
                'links' => ['next' => null],
            ])),
        ]);

        $lists = $this->createIntegration()->fetchLists($client);

        self::assertSame(['ListA', 'ListB'], array_map(static fn (ListObject $list) => $list->getResourceId(), $lists));
        self::assertSame(['Newsletter', 'Customers'], array_map(static fn (ListObject $list) => $list->getName(), $lists));
        self::assertSame($next, (string) $this->history[1]['request']->getUri());
    }

    #[DataProvider('invalidPaginationProvider')]
    public function testListDiscoveryRejectsInvalidPagination(mixed $next): void
    {
        $client = $this->createClient([new Response(200, [], json_encode([
            'data' => [],
            'links' => ['next' => $next],
        ]))]);

        $this->expectException(IntegrationException::class);

        try {
            $this->createIntegration()->fetchLists($client);
        } finally {
            self::assertCount(1, $this->history);
        }
    }

    public static function invalidPaginationProvider(): iterable
    {
        yield 'another host' => ['https://example.com/api/lists/?page[cursor]=next'];

        yield 'insecure URL' => ['http://a.klaviyo.com/api/lists/?page[cursor]=next'];

        yield 'another endpoint' => ['https://a.klaviyo.com/api/profiles/'];

        yield 'repeated page' => ['https://a.klaviyo.com/api/lists/'];

        yield 'non-string link' => [['href' => 'https://example.com']];
    }

    public function testInvalidListResponseIsNotTreatedAsAnEmptyAccount(): void
    {
        $client = $this->createClient([new Response(200, [], '{}')]);

        $this->expectException(IntegrationException::class);
        $this->createIntegration()->fetchLists($client);
    }

    public function testCustomFieldNamesAreExactAndSeparateFromProfileFields(): void
    {
        $integration = $this->createIntegration(['customProperties' => " Favorite Color \r\nfirst_name\nFavorite Color\nPreference.Topic\n0\n"]);
        $client = $this->createClient([]);
        $list = new ListObject('ListA', 'Newsletter');
        $fields = $integration->fetchFields($list, Klaviyo::CATEGORY_CUSTOM, $client);

        self::assertSame(['Favorite Color', 'first_name', 'Preference.Topic', '0'], array_map(static fn ($field) => $field->getHandle(), $fields));
        self::assertSame([], $integration->fetchFields($list, 'unknown', $client));
        self::assertSame([], $this->history);
    }

    #[DataProvider('profileStatusProvider')]
    public function testCreatesOrUpdatesProfileThenSubscribesEmail(int $profileStatus): void
    {
        $integration = $this->createIntegration([
            'customProperties' => "Favorite Color\nfirst_name\nPreference.Topic",
            'profileMapping' => (new FieldMapping())
                ->add('first_name', FieldMapItem::TYPE_RELATION, 'firstName')
                ->add('location.city', FieldMapItem::TYPE_RELATION, 'city')
                ->add('location.longitude', FieldMapItem::TYPE_RELATION, 'longitude')
                ->add('phone_number', FieldMapItem::TYPE_RELATION, 'phone')
                ->add('last_name', FieldMapItem::TYPE_RELATION, 'blank')
                ->add('unknown', FieldMapItem::TYPE_PRESET, 'ignored'),
            'customMapping' => (new FieldMapping())
                ->add('Favorite Color', FieldMapItem::TYPE_RELATION, 'colors')
                ->add('first_name', FieldMapItem::TYPE_PRESET, 'Custom value')
                ->add('Preference.Topic', FieldMapItem::TYPE_PRESET, 'News'),
        ]);
        $form = $this->createForm([
            'email' => ' subscriber@example.com ',
            'firstName' => ' Sarah ',
            'city' => 'Winnipeg',
            'longitude' => '-97.1384',
            'phone' => '+12045550123',
            'blank' => '',
            'colors' => ['Blue', 'Green'],
        ]);
        $client = $this->createClient([
            new Response($profileStatus, [], '{"data":{"type":"profile","id":"profile-id"}}'),
            new Response(202),
        ]);

        $integration->push($form, $client);

        self::assertCount(2, $this->history);
        self::assertSame('/api/profile-import/', $this->history[0]['request']->getUri()->getPath());
        self::assertSame('POST', $this->history[0]['request']->getMethod());
        self::assertSame([
            'data' => [
                'type' => 'profile',
                'attributes' => [
                    'email' => 'subscriber@example.com',
                    'first_name' => 'Sarah',
                    'location' => ['city' => 'Winnipeg', 'longitude' => '-97.1384'],
                    'phone_number' => '+12045550123',
                    'properties' => [
                        'Favorite Color' => 'Blue, Green',
                        'first_name' => 'Custom value',
                        'Preference.Topic' => 'News',
                    ],
                ],
            ],
        ], $this->getRequestBody(0));

        self::assertSame('/api/profile-subscription-bulk-create-jobs/', $this->history[1]['request']->getUri()->getPath());
        $subscription = $this->getRequestBody(1)['data'];
        self::assertSame('profile-subscription-bulk-create-job', $subscription['type']);
        self::assertSame(['list' => ['data' => ['type' => 'list', 'id' => 'ListA']]], $subscription['relationships']);
        self::assertSame([
            'type' => 'profile',
            'id' => 'profile-id',
            'attributes' => [
                'email' => 'subscriber@example.com',
                'subscriptions' => ['email' => ['marketing' => ['consent' => 'SUBSCRIBED']]],
            ],
        ], $subscription['attributes']['profiles']['data'][0]);
        self::assertArrayNotHasKey('historical_import', $subscription['attributes']);
    }

    public static function profileStatusProvider(): iterable
    {
        yield 'new profile' => [201];

        yield 'existing profile' => [200];
    }

    public function testNumericPropertyNamesRemainJsonObjectKeysAndZeroIsNotDropped(): void
    {
        $integration = $this->createIntegration([
            'customProperties' => '0',
            'customMapping' => (new FieldMapping())->add('0', FieldMapItem::TYPE_PRESET, '0'),
        ]);
        $client = $this->createClient([
            new Response(201, [], '{"data":{"id":"profile-id"}}'),
            new Response(202),
        ]);

        $integration->push($this->createForm(['email' => 'subscriber@example.com']), $client);

        $body = json_decode((string) $this->history[0]['request']->getBody());
        self::assertInstanceOf(\stdClass::class, $body->data->attributes->properties);
        self::assertSame('0', $body->data->attributes->properties->{'0'});
    }

    #[DataProvider('skipProvider')]
    public function testSkipsAllRequestsWhenSubscriptionIsNotConfiguredOrOptedIn(array $properties, array $values): void
    {
        $integration = $this->createIntegration($properties);
        $client = $this->createClient([]);

        $integration->push($this->createForm($values), $client);

        self::assertSame([], $this->history);
    }

    public static function skipProvider(): iterable
    {
        yield 'no list' => [['mailingList' => null], ['email' => 'subscriber@example.com']];

        yield 'empty list ID' => [['mailingList' => new ListObject('', 'Newsletter')], ['email' => 'subscriber@example.com']];

        yield 'no selected email field' => [['emailField' => null], ['email' => 'subscriber@example.com']];

        yield 'missing email field' => [[], []];

        yield 'blank email' => [[], ['email' => " \t "]];

        yield 'unchecked opt-in' => [['optInField' => 'optIn'], ['email' => 'subscriber@example.com', 'optIn' => false]];

        yield 'missing opt-in field' => [['optInField' => 'optIn'], ['email' => 'subscriber@example.com']];
    }

    public function testCheckedOptInSendsBothRequests(): void
    {
        $integration = $this->createIntegration(['optInField' => 'optIn']);
        $client = $this->createClient([
            new Response(201, [], '{"data":{"id":"profile-id"}}'),
            new Response(202),
        ]);

        $integration->push($this->createForm(['email' => 'subscriber@example.com', 'optIn' => true]), $client);

        self::assertCount(2, $this->history);
        self::assertSame(['email' => 'subscriber@example.com'], $this->getRequestBody(0)['data']['attributes']);
    }

    public function testProfileFailureDoesNotAttemptSubscription(): void
    {
        $client = $this->createClient([new Response(400, [], '{"errors":[{"detail":"Invalid phone number"}]}')]);

        $this->expectException(RequestException::class);

        try {
            $this->createIntegration()->push($this->createForm(['email' => 'subscriber@example.com']), $client);
        } finally {
            self::assertCount(1, $this->history);
        }
    }

    public function testMissingProfileIdDoesNotAttemptSubscription(): void
    {
        $client = $this->createClient([new Response(201, [], '{"data":{}}')]);

        $this->expectException(IntegrationException::class);

        try {
            $this->createIntegration()->push($this->createForm(['email' => 'subscriber@example.com']), $client);
        } finally {
            self::assertCount(1, $this->history);
        }
    }

    public function testSubscriptionRateLimitIsPropagatedForIntegrationErrorHandling(): void
    {
        $client = $this->createClient([
            new Response(200, [], '{"data":{"id":"profile-id"}}'),
            new Response(429, ['Retry-After' => '60'], '{"errors":[{"detail":"Rate limited"}]}'),
        ]);

        $this->expectException(RequestException::class);

        try {
            $this->createIntegration()->push($this->createForm(['email' => 'subscriber@example.com']), $client);
        } finally {
            self::assertCount(2, $this->history);
        }
    }

    public function testUnexpectedSubscriptionResponseIsNotReportedAsAccepted(): void
    {
        $client = $this->createClient([
            new Response(200, [], '{"data":{"id":"profile-id"}}'),
            new Response(204),
        ]);

        $this->expectException(IntegrationException::class);
        $this->createIntegration()->push($this->createForm(['email' => 'subscriber@example.com']), $client);
    }

    private function createIntegration(array $properties = []): Klaviyo
    {
        $integration = new Klaviyo(
            1,
            2,
            'integration-uid',
            'instance-uid',
            true,
            false,
            'klaviyo',
            'Klaviyo',
            new Type('Klaviyo', Type::TYPE_EMAIL_MARKETING),
            new NullLogger(),
        );

        $properties += [
            'mailingList' => new ListObject('ListA', 'Newsletter'),
            'emailField' => 'email',
        ];
        foreach ($properties as $name => $value) {
            if (\in_array($name, ['emailField', 'optInField'], true) && \is_string($value)) {
                $value = $this->createConfiguredMock(FieldInterface::class, ['getUid' => $value]);
            }

            $property = new \ReflectionProperty($integration, $name);
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

    private function getRequestBody(int $index): array
    {
        return json_decode((string) $this->history[$index]['request']->getBody(), true, 512, \JSON_THROW_ON_ERROR);
    }
}
