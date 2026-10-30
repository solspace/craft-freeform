<?php

namespace Solspace\Freeform\Tests\Integrations\CRM\Salesforce;

use craft\elements\Asset;
use craft\elements\db\AssetQuery;
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
use Solspace\Freeform\Events\Integrations\IntegrationResponseEvent;
use Solspace\Freeform\Events\Integrations\PushEvent;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Implementations\FileUploadField;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Form\Layout\FormLayout;
use Solspace\Freeform\Integrations\CRM\Salesforce\BaseSalesforceIntegration;
use Solspace\Freeform\Integrations\CRM\Salesforce\Versions\SalesforceV58;
use Solspace\Freeform\Library\Collections\FieldCollection;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;
use yii\base\Event;

#[CoversClass(BaseSalesforceIntegration::class)]
#[CoversClass(SalesforceV58::class)]
class SalesforceCasesTest extends TestCase
{
    private array $history = [];

    public function testCaseFieldsUseCreatePermissionsDefaultsAndActivePicklists(): void
    {
        $integration = $this->integration();
        $fields = $integration->fetchFields('Case', $this->client([new Response(200, [], json_encode(['fields' => [
            $this->field('Subject'),
            $this->field('CreateOnly__c', ['updateable' => false, 'nillable' => false]),
            $this->field('CaseNumber', ['createable' => false]),
            $this->field('Status', ['nillable' => false, 'defaultedOnCreate' => true, 'type' => 'picklist', 'picklistValues' => [
                ['value' => 'New', 'label' => 'New', 'active' => true],
                ['value' => 'Retired', 'label' => 'Retired', 'active' => false],
            ]]),
            $this->field('SuppliedEmail', ['type' => 'email']),
            $this->field('ContactId', ['type' => 'reference']),
        ]]))]));

        self::assertSame('/services/data/v58.0/sobjects/Case/describe', $this->history[0]['request']->getUri()->getPath());
        self::assertSame(['Subject', 'CreateOnly__c', 'Status', 'SuppliedEmail', 'ContactId'], array_map(static fn (FieldObject $field) => $field->getHandle(), $fields));
        self::assertTrue($fields[1]->isRequired());
        self::assertFalse($fields[2]->isRequired());
        self::assertCount(1, $fields[2]->getOptions());
        self::assertSame('Case', $fields[0]->getCategory());
        self::assertSame(FieldObject::TYPE_STRING, $fields[3]->getType());
    }

    public function testExistingObjectFieldDiscoveryIsUnchanged(): void
    {
        $fields = $this->integration()->fetchFields('Lead', $this->client([new Response(200, [], json_encode(['fields' => [
            $this->field('Company', ['nillable' => false, 'defaultedOnCreate' => true]),
            $this->field('CreateOnly__c', ['updateable' => false]),
        ]]))]));
        self::assertCount(1, $fields);
        self::assertTrue($fields[0]->isRequired());
    }

    public function testCasesAreOptInAndEmptyMappingsDoNotSendRequests(): void
    {
        $client = $this->client([]);
        $this->integration(['caseMapping' => $this->mapping(['Subject' => 'Ignored'])])->push($this->form(), $client);
        $this->integration(['mapCases' => true])->push($this->form(), $client);
        $this->integration(['mapCases' => true, 'caseMapping' => new FieldMapping()])->push($this->form(), $client);
        self::assertSame([], $this->history);
    }

    public function testStandaloneCasesMapValuesAndAlwaysCreateNewRecords(): void
    {
        $mapping = $this->mapping(['Origin' => 'Web', 'Priority' => 'High', 'Custom__c' => 'Custom value']);
        $mapping->add('Subject', FieldMapItem::TYPE_RELATION, 'subject-field');
        $mapping->add('SuppliedEmail', FieldMapItem::TYPE_RELATION, 'email-field');
        $integration = $this->integration(['mapCases' => true, 'caseMapping' => $mapping]);
        $form = $this->form(['subject-field' => 'Support request', 'email-field' => 'visitor@example.test']);
        $client = $this->client([$this->created('case-1'), $this->created('case-2')]);
        $integration->push($form, $client);
        $integration->push($form, $client);

        self::assertCount(2, $this->history);
        foreach ($this->history as $transaction) {
            $request = $transaction['request'];
            self::assertSame('POST', $request->getMethod());
            self::assertSame('/services/data/v58.0/sobjects/Case', $request->getUri()->getPath());
            self::assertSame('TRUE', $request->getHeaderLine('Sforce-Auto-Assign'));
            self::assertSame([
                'Origin' => 'Web', 'Priority' => 'High', 'Custom__c' => 'Custom value',
                'Subject' => 'Support request', 'SuppliedEmail' => 'visitor@example.test',
            ], json_decode((string) $request->getBody(), true));
        }
    }

    public function testAssignmentRulesCanBeDisabledForMappedOwner(): void
    {
        $this->integration([
            'mapCases' => true, 'assignCaseOwner' => false,
            'caseMapping' => $this->mapping(['Subject' => 'Support', 'OwnerId' => 'queue-id']),
        ])->push($this->form(), $this->client([$this->created('case-1')]));
        self::assertSame('FALSE', $this->history[0]['request']->getHeaderLine('Sforce-Auto-Assign'));
        self::assertSame('queue-id', $this->body(0)['OwnerId']);
    }

    public function testCasesCanBeCreatedAlongsideLeadsAndOpportunities(): void
    {
        $this->integration([
            'mapCases' => true, 'caseMapping' => $this->mapping(['Subject' => 'Support']),
            'mapLeads' => true, 'leadMapping' => $this->mapping(['LastName' => 'Visitor']),
            'mapOpportunities' => true, 'opportunityMapping' => $this->mapping(['Name' => 'Deal']),
            'closeDate' => '+7 days', 'stage' => 'Prospecting',
        ])->push($this->form(), $this->client([$this->created('lead-1'), $this->created('opportunity-1'), $this->created('case-1')]));
        self::assertSame([
            '/services/data/v58.0/sobjects/Lead',
            '/services/data/v58.0/sobjects/Opportunity',
            '/services/data/v58.0/sobjects/Case',
        ], array_map(static fn (array $transaction) => $transaction['request']->getUri()->getPath(), $this->history));
        self::assertSame(['Subject' => 'Support'], $this->body(2));
    }

    public function testAttachmentOptionWithNoUploadsDoesNotSendFileRequests(): void
    {
        $this->integration(['mapCases' => true, 'filesForCases' => true, 'caseMapping' => $this->mapping(['Subject' => 'Support'])])
            ->push($this->form(), $this->client([$this->created('case-1')]))
        ;
        self::assertCount(1, $this->history);
    }

    #[DataProvider('relationshipProvider')]
    public function testCasesLinkMatchedOrCreatedRecordsAndRespectExplicitMappings(bool $existing, bool $explicit): void
    {
        $caseValues = ['Subject' => 'Support'];
        if ($explicit) {
            $caseValues += ['AccountId' => 'mapped-account', 'ContactId' => 'mapped-contact'];
        }
        $integration = $this->integration([
            'mapCases' => true, 'caseMapping' => $this->mapping($caseValues),
            'mapAccounts' => true, 'accountMapping' => $this->mapping(['Name' => 'Example', 'Website' => 'example.test']),
            'mapContacts' => true, 'contactMapping' => $this->mapping(['Email' => 'visitor@example.test', 'LastName' => 'Visitor']),
        ]);
        $responses = $existing ? [
            $this->records([['Id' => 'account-id']]), new Response(204),
            $this->records([['Id' => 'contact-id']]), new Response(204),
        ] : [
            $this->records([]), $this->created('account-id'),
            $this->records([]), $this->records([]), $this->created('contact-id'),
        ];
        $responses[] = $this->created('case-1');
        $responses[] = $this->created('case-2');
        $client = $this->client($responses);
        $integration->push($this->form(), $client);
        $caseIndex = \count($this->history) - 1;
        self::assertSame($explicit ? 'mapped-account' : 'account-id', $this->body($caseIndex)['AccountId']);
        self::assertSame($explicit ? 'mapped-contact' : 'contact-id', $this->body($caseIndex)['ContactId']);

        // Reusing the integration for another submission must not leak previous relationships.
        $this->setProperties($integration, ['mapAccounts' => false, 'mapContacts' => false, 'caseMapping' => $this->mapping(['Subject' => 'Another request'])]);
        $integration->push($this->form(), $client);
        self::assertSame(['Subject' => 'Another request'], $this->body($caseIndex + 1));
    }

    public static function relationshipProvider(): iterable
    {
        yield 'created records' => [false, false];

        yield 'matched records' => [true, false];

        yield 'explicit mappings override created records' => [false, true];

        yield 'explicit mappings override matched records' => [true, true];
    }

    public function testCasePushAndResponseEventsAreDispatched(): void
    {
        $categories = [];
        $before = static function (PushEvent $event) use (&$categories): void {
            $categories[] = $event->getCategory();
            $event->addValue('Description', 'Added by event');
        };
        $after = static function (IntegrationResponseEvent $event) use (&$categories): void {
            $categories[] = $event->getCategory();
            self::assertSame(201, $event->getResponse()->getStatusCode());
        };
        Event::on(SalesforceV58::class, SalesforceV58::EVENT_ON_PUSH, $before);
        Event::on(SalesforceV58::class, SalesforceV58::EVENT_AFTER_RESPONSE, $after);

        try {
            $this->integration(['mapCases' => true, 'caseMapping' => $this->mapping(['Subject' => 'Support'])])
                ->push($this->form(), $this->client([$this->created('case-1')]))
            ;
            self::assertSame(['Case', 'Case'], $categories);
            self::assertSame('Added by event', $this->body(0)['Description']);
        } finally {
            Event::off(SalesforceV58::class, SalesforceV58::EVENT_ON_PUSH, $before);
            Event::off(SalesforceV58::class, SalesforceV58::EVENT_AFTER_RESPONSE, $after);
        }
    }

    public function testRejectedCasesPropagateApiErrorsWithoutUploadingFiles(): void
    {
        $integration = $this->integration(['mapCases' => true, 'filesForCases' => true, 'caseMapping' => $this->mapping(['Subject' => 'Support'])]);
        $this->expectException(RequestException::class);

        try {
            $integration->push($this->form(), $this->client([new Response(400, [], '[{"errorCode":"REQUIRED_FIELD_MISSING"}]')]));
        } finally {
            self::assertCount(1, $this->history);
        }
    }

    public function testInvalidCreationResponsesFailBeforeUploadingFiles(): void
    {
        $this->expectException(IntegrationException::class);
        $this->integration(['mapCases' => true, 'filesForCases' => true, 'caseMapping' => $this->mapping(['Subject' => 'Support'])])
            ->push($this->form(), $this->client([new Response(201, [], '{"success":false}')]))
        ;
    }

    public function testUploadedFilesAreLinkedToEachNewCaseWithoutReusingPreviousSubmissionFiles(): void
    {
        if (!class_exists(AssetQuery::class)) {
            self::markTestSkipped('File upload coverage requires the supported Craft 4 or 5 AssetQuery.');
        }

        $asset = $this->createConfiguredMock(Asset::class, ['getFilename' => 'support.txt', 'getContents' => 'Support attachment']);
        $asset->id = 101;
        $asset->title = 'Support attachment';
        $assets = new class($asset) extends AssetQuery implements \IteratorAggregate {
            public function __construct(private Asset $asset) {}

            public function getIterator(): \ArrayIterator
            {
                return new \ArrayIterator([$this->asset]);
            }
        };
        $upload = $this->createConfiguredMock(FileUploadField::class, ['getAssets' => $assets]);
        $layout = $this->createConfiguredMock(FormLayout::class, ['getFields' => new FieldCollection([$upload])]);
        $integration = $this->integration(['mapCases' => true, 'filesForCases' => true, 'caseMapping' => $this->mapping(['Subject' => 'Support'])]);
        $responses = [];
        foreach ([1, 2] as $index) {
            $responses[] = $this->created('case-'.$index);
            $responses[] = new Response(200, [], json_encode(['compositeResponse' => [['body' => ['id' => 'version-'.$index]]]]));
            $responses[] = $this->records([['ContentDocumentId' => 'document-'.$index]]);
            $responses[] = new Response(200, [], '{"compositeResponse":[]}');
        }
        $client = $this->client($responses);
        $integration->push($this->form([], $layout), $client);
        $integration->push($this->form([], $layout), $client);

        self::assertCount(8, $this->history);
        foreach ([0 => 1, 4 => 2] as $offset => $index) {
            $uploaded = $this->body($offset + 1)['compositeRequest'][0];
            self::assertSame('/services/data/v58.0/sobjects/ContentVersion', $uploaded['url']);
            self::assertSame(base64_encode('Support attachment'), $uploaded['body']['VersionData']);
            $linked = $this->body($offset + 3)['compositeRequest'][0];
            self::assertSame('/services/data/v58.0/sobjects/ContentDocumentLink', $linked['url']);
            self::assertSame('case-'.$index, $linked['body']['LinkedEntityId']);
            self::assertSame('document-'.$index, $linked['body']['ContentDocumentId']);
        }
    }

    private function integration(array $properties = []): SalesforceV58
    {
        $integration = $this->getMockBuilder(SalesforceV58::class)
            ->setConstructorArgs([1, 2, 'integration-uid', 'instance-uid', true, false, 'salesforce', 'Salesforce CRM', new Type('Salesforce CRM', Type::TYPE_CRM), new NullLogger()])
            ->onlyMethods(['getProcessableFields'])->getMock()
        ;
        $integration->method('getProcessableFields')->willReturnCallback(static function (string $category) use ($properties): array {
            $mappingName = lcfirst($category).'Mapping';
            $fields = [];
            foreach ($properties[$mappingName] ?? [] as $item) {
                $fields[$item->getSource()] = new FieldObject($item->getSource(), $item->getSource(), FieldObject::TYPE_STRING, $category);
            }

            return $fields;
        });
        $this->setProperties($integration, $properties + ['instanceUrl' => 'https://example.my.salesforce.com']);

        return $integration;
    }

    private function setProperties(SalesforceV58 $integration, array $properties): void
    {
        foreach ($properties as $name => $value) {
            (new \ReflectionProperty(SalesforceV58::class, $name))->setValue($integration, $value);
        }
    }

    private function mapping(array $values): FieldMapping
    {
        $mapping = new FieldMapping();
        foreach ($values as $name => $value) {
            $mapping->add($name, FieldMapItem::TYPE_PRESET, $value);
        }

        return $mapping;
    }

    private function form(array $values = [], ?FormLayout $layout = null): Form
    {
        $fields = [];
        foreach ($values as $uid => $value) {
            $fields[$uid] = $this->createConfiguredMock(FieldInterface::class, ['getValue' => $value]);
        }
        $form = $this->createMock(Form::class);
        $form->method('get')->willReturnCallback(static fn ($uid) => $fields[$uid] ?? null);
        $form->method('getLayout')->willReturn($layout ?? new FormLayout());

        return $form;
    }

    private function client(array $responses): Client
    {
        $stack = HandlerStack::create(new MockHandler($responses));
        $stack->push(Middleware::history($this->history));

        return new Client(['handler' => $stack]);
    }

    private function created(string $id): Response
    {
        return new Response(201, [], json_encode(['id' => $id, 'success' => true]));
    }

    private function records(array $records): Response
    {
        return new Response(200, [], json_encode(['records' => $records, 'totalSize' => \count($records), 'done' => true]));
    }

    private function field(string $name, array $overrides = []): array
    {
        return $overrides + ['name' => $name, 'label' => $name, 'type' => 'string', 'createable' => true, 'updateable' => true, 'nillable' => true, 'defaultedOnCreate' => false, 'picklistValues' => []];
    }

    private function body(int $index): array
    {
        return json_decode((string) $this->history[$index]['request']->getBody(), true);
    }
}
