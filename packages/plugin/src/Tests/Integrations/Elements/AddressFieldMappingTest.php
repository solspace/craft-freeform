<?php

namespace Solspace\Freeform\Tests\Integrations\Elements;

use craft\base\ElementInterface;
use craft\elements\Address;
use craft\elements\ElementCollection;
use craft\elements\Entry as CraftEntry;
use craft\fields\Addresses;
use craft\fields\PlainText;
use craft\models\FieldLayout;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Attributes\Property\Implementations\FieldMapping\FieldMapItem;
use Solspace\Freeform\Attributes\Property\Implementations\FieldMapping\FieldMapping;
use Solspace\Freeform\Bundles\Form\ElementEdit\ElementEditBundle;
use Solspace\Freeform\Bundles\Integrations\Elements\AddressFieldMapping;
use Solspace\Freeform\Bundles\Integrations\Elements\ElementFieldMappingHelper;
use Solspace\Freeform\Bundles\Integrations\Elements\ValueTransformers\ArrayValueTransformer;
use Solspace\Freeform\Bundles\Integrations\Providers\FormIntegrationsProvider;
use Solspace\Freeform\Events\Forms\RegisterContextEvent;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Implementations\Pro\LocationField;
use Solspace\Freeform\Form\Bags\PropertyBag;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Form\Layout\Page;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Integrations\Elements\Entry\Entry;
use Solspace\Freeform\Library\Collections\FieldCollection;
use Solspace\Freeform\Library\Integrations\Types\Elements\ElementIntegration;
use Solspace\Freeform\Library\Integrations\Types\Elements\ElementIntegrationInterface;
use yii\base\Event;

#[CoversClass(AddressFieldMapping::class)]
#[CoversClass(ElementIntegration::class)]
#[CoversClass(ElementEditBundle::class)]
#[CoversClass(ElementFieldMappingHelper::class)]
class AddressFieldMappingTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        if (!class_exists(Addresses::class)) {
            self::markTestSkipped('Native Addresses fields require Craft 5.');
        }
    }

    protected function tearDown(): void
    {
        Event::off(ElementIntegrationInterface::class, ElementIntegrationInterface::EVENT_PROCESS_VALUE);
        parent::tearDown();
    }

    public function testAddressComponentsAppearAlongsideOrdinaryCustomFields(): void
    {
        $field = $this->addressField();
        $rows = AddressFieldMapping::getMappingFields($field);
        self::assertContains(['id' => 'address.countryCode', 'label' => 'Mailing Address — Country Code', 'required' => false], $rows);
        self::assertContains('address.addressLine1', array_column($rows, 'id'));
        self::assertNotContains('address.ownerId', array_column($rows, 'id'));
        self::assertNull(AddressFieldMapping::getAttribute($field, 'address.ownerId'));

        $text = $this->getMockBuilder(PlainText::class)->disableOriginalConstructor()->getMock();
        $text->handle = 'notes';
        $text->name = 'Notes';
        $text->required = true;
        self::assertSame([['id' => 'notes', 'label' => 'Notes', 'required' => true]], AddressFieldMapping::getMappingFields($text));
        self::assertNull(AddressFieldMapping::getAttribute($text, 'notes.countryCode'));
    }

    public function testComponentMappingsAreCombinedIntoOneNativeAddressPayload(): void
    {
        [$element, $saved] = $this->owner();
        $mapping = (new FieldMapping())
            ->add('address.addressLine1', FieldMapItem::TYPE_PRESET, '123 Test Street')
            ->add('address.locality', FieldMapItem::TYPE_PRESET, 'Winnipeg')
            ->add('address.countryCode', FieldMapItem::TYPE_PRESET, ' ca ')
        ;
        $this->process($element, $mapping);

        self::assertSame('123 Test Street', $saved->value['new1']['addressLine1']);
        self::assertSame('Winnipeg', $saved->value['new1']['locality']);
        self::assertSame('CA', $saved->value['new1']['countryCode']);
        self::assertSame('Mailing Address', $saved->value['new1']['title']);
        self::assertSame(1, $saved->writes);
    }

    public function testEditingPreservesOtherAddressesAndUnmappedValuesIncludingCoordinates(): void
    {
        [$element, $saved] = $this->owner([
            $this->address(['id' => 42, 'addressLine1' => 'Keep Street', 'addressLine2' => 'Clear me', 'countryCode' => 'CA', 'latitude' => '49.9', 'longitude' => '-97.1']),
            $this->address(['id' => 43, 'addressLine1' => 'Other Address', 'enabled' => false, 'countryCode' => 'US']),
        ]);
        $this->process($element, (new FieldMapping())->add('address.addressLine2', FieldMapItem::TYPE_PRESET, ''));

        self::assertSame([42, 43], array_keys($saved->value));
        self::assertSame('Keep Street', $saved->value[42]['addressLine1']);
        self::assertSame('', $saved->value[42]['addressLine2']);
        self::assertSame('49.9', $saved->value[42]['latitude']);
        self::assertSame('-97.1', $saved->value[42]['longitude']);
        self::assertSame(['privateNotes' => 'Keep custom content'], $saved->value[42]['fields']);
        self::assertSame('Other Address', $saved->value[43]['addressLine1']);
        self::assertFalse($saved->value[43]['enabled']);
    }

    public function testUnmappedAndEntirelyBlankOptionalAddressesAreLeftAlone(): void
    {
        [$element, $saved] = $this->owner();
        $this->process(
            $element,
            (new FieldMapping())
                ->add('address.addressLine1', FieldMapItem::TYPE_RELATION, '')
                ->add('address.countryCode', FieldMapItem::TYPE_PRESET, '  ')
        );
        self::assertSame(0, $saved->writes);
    }

    public function testPendingNewAddressesKeepTheirSerializedKeysAlongsideSavedAddresses(): void
    {
        [$element, $saved] = $this->owner([
            $this->address(['id' => 42, 'addressLine1' => 'Saved Address']),
            $this->address(['addressLine1' => 'Pending Address', 'latitude' => '0']),
        ]);
        $this->process($element, (new FieldMapping())->add('address.locality', FieldMapItem::TYPE_PRESET, 'Winnipeg'));
        self::assertSame([42, 'new1'], array_keys($saved->value));
        self::assertSame('Pending Address', $saved->value['new1']['addressLine1']);
        self::assertSame('0', $saved->value['new1']['latitude']);
    }

    public function testZeroCoordinatesAreNotTreatedAsEmpty(): void
    {
        [$element, $saved] = $this->owner();
        $this->process($element, (new FieldMapping())->add('address.latitude', FieldMapItem::TYPE_PRESET, '0'));
        self::assertSame('0', $saved->value['new1']['latitude']);
    }

    public function testSeparateFormFieldsCanSupplyAddressComponents(): void
    {
        [$element, $saved] = $this->owner();
        $country = $this->createMock(FieldInterface::class);
        $country->method('getValue')->willReturn(['ca']);
        $form = $this->createMock(Form::class);
        $form->method('get')->with('country-uid')->willReturn($country);
        $this->process($element, (new FieldMapping())->add('address.countryCode', FieldMapItem::TYPE_RELATION, 'country-uid'), $form);
        self::assertSame('CA', $saved->value['new1']['countryCode']);
    }

    public function testUpdatingFirstNameClearsStaleFullNameAndPreservesLastName(): void
    {
        [$element, $saved] = $this->owner([$this->address(['id' => 42, 'fullName' => 'Old Person', 'firstName' => 'Old', 'lastName' => 'Person'])]);
        $this->process($element, (new FieldMapping())->add('address.firstName', FieldMapItem::TYPE_PRESET, 'New'));
        $address = AddressFieldMapping::getAddresses($element, $this->addressField())[0];
        self::assertSame('New', $address->firstName);
        self::assertNull($address->fullName);
        self::assertSame('Person', $address->lastName);
    }

    public function testNestedValidationErrorsReachTheirMappedFormField(): void
    {
        $address = $this->address(['id' => 42]);
        $address->addError('countryCode', 'Select a valid country code.');
        [$element] = $this->owner([$address]);
        $element->method('getErrors')->willReturn(['address' => ['Invalid address.']]);
        $country = $this->createMock(FieldInterface::class);
        $country->method('getId')->willReturn(1);
        $country->expects(self::exactly(2))->method('addErrors')->with(self::isType('array'));
        $form = $this->createMock(Form::class);
        $form->method('get')->willReturn($country);
        $page = $this->createMock(Page::class);
        $page->method('getFields')->willReturn(new FieldCollection([$country]));
        $form->method('getCurrentPage')->willReturn($page);
        $integration = (new \ReflectionClass(Entry::class))->newInstanceWithoutConstructor();
        (new \ReflectionProperty(Entry::class, 'fieldMapping'))->setValue($integration, (new FieldMapping())->add('address.countryCode', FieldMapItem::TYPE_RELATION, 'country-uid'));

        (new ElementFieldMappingHelper())->attachErrors($form, $element, $integration);
    }

    public function testLocationComponentsCanPopulateANativeCraftAddress(): void
    {
        [$element, $saved] = $this->owner();
        $form = $this->createMock(Form::class);
        $location = new LocationField($form);
        $location->setValue(['line1' => '123 Main Street', 'city' => 'Winnipeg', 'state' => 'Manitoba', 'country' => 'Canada']);
        $form->method('get')->with('location-uid')->willReturn($location);
        $this->process($element, (new FieldMapping())
            ->add('address.addressLine1', FieldMapItem::TYPE_RELATION, 'location-uid.line1')
            ->add('address.locality', FieldMapItem::TYPE_RELATION, 'location-uid.city')
            ->add('address.administrativeArea', FieldMapItem::TYPE_RELATION, 'location-uid.stateCode')
            ->add('address.countryCode', FieldMapItem::TYPE_RELATION, 'location-uid.countryCode'), $form);
        self::assertSame('123 Main Street', $saved->value['new1']['addressLine1']);
        self::assertSame('Winnipeg', $saved->value['new1']['locality']);
        self::assertSame('MB', $saved->value['new1']['administrativeArea']);
        self::assertSame('CA', $saved->value['new1']['countryCode']);
    }

    #[TestWith([false])]
    #[TestWith([true])]
    public function testElementEditingPrefillsComponentsFromTheFirstAddress(bool $useLocation): void
    {
        [$element] = $this->owner([
            $this->address(['id' => 42, 'locality' => 'Winnipeg', 'countryCode' => 'CA']),
            $this->address(['id' => 43, 'locality' => 'New York', 'countryCode' => 'US']),
        ]);
        $mapping = (new FieldMapping())
            ->add('address.locality', FieldMapItem::TYPE_RELATION, $useLocation ? 'location-uid.city' : 'city-uid')
            ->add('address.countryCode', FieldMapItem::TYPE_RELATION, $useLocation ? 'location-uid.countryCode' : 'country-uid')
        ;
        $integration = (new \ReflectionClass(Entry::class))->newInstanceWithoutConstructor();
        (new \ReflectionProperty(Entry::class, 'fieldMapping'))->setValue($integration, $mapping);
        $provider = $this->createMock(FormIntegrationsProvider::class);
        $provider->method('getForForm')->willReturn([$integration]);
        $plugin = $this->createMock(Freeform::class);
        $plugin->method('isPro')->willReturn(true);
        $bundle = new class($provider, $plugin) extends ElementEditBundle {
            public function __construct(FormIntegrationsProvider $provider, private Freeform $freeform)
            {
                parent::__construct($provider);
            }

            protected function plugin(): Freeform
            {
                return $this->freeform;
            }
        };
        $city = $this->createMock(FieldInterface::class);
        $city->expects($useLocation ? self::never() : self::once())->method('setValue')->with('Winnipeg');
        $country = $this->createMock(FieldInterface::class);
        $country->expects($useLocation ? self::never() : self::once())->method('setValue')->with('CA');
        $form = $this->createMock(Form::class);
        $location = new LocationField($form);
        $location->setValue(['line1' => 'Keep Street']);
        $properties = $this->createMock(PropertyBag::class);
        $properties->method('get')->with(ElementEditBundle::ELEMENT_KEY)->willReturn(99);
        $form->method('getProperties')->willReturn($properties);
        $form->method('get')->willReturnMap([['city-uid', $city], ['country-uid', $country], ['location-uid', $location]]);
        $previousApp = \Craft::$app;

        try {
            \Craft::$app = (object) ['elements' => new class($element) {
                public function __construct(private ElementInterface $element) {}

                public function getElementById($id): ElementInterface
                {
                    return $this->element;
                }
            }];
            $bundle->populateFormWithElementValues(new RegisterContextEvent($form));
            if ($useLocation) {
                self::assertSame(['line1' => 'Keep Street', 'city' => 'Winnipeg', 'country' => 'CA'], $location->getValue());
            }
        } finally {
            \Craft::$app = $previousApp;
            Event::off(Form::class, Form::EVENT_REGISTER_CONTEXT, [$bundle, 'populateFormWithElementValues']);
        }
    }

    private function process(ElementInterface $element, FieldMapping $mapping, ?Form $form = null): void
    {
        new ArrayValueTransformer();
        $integration = (new \ReflectionClass(Entry::class))->newInstanceWithoutConstructor();
        (new \ReflectionMethod(ElementIntegration::class, 'processMapping'))->invoke($integration, $element, $form ?? $this->createMock(Form::class), $mapping);
    }

    private function addressField(): Addresses
    {
        $field = $this->getMockBuilder(Addresses::class)->disableOriginalConstructor()->onlyMethods([])->getMock();
        $field->handle = 'address';
        $field->name = 'Mailing Address';
        $field->id = 7;

        return $field;
    }

    private function address(array $attributes): Address
    {
        $address = $this->getMockBuilder(Address::class)->disableOriginalConstructor()->onlyMethods(['getSerializedFieldValues'])->getMock();
        foreach ($attributes as $key => $value) {
            $address->{$key} = $value;
        }
        $address->countryCode ??= 'CA';
        $address->method('getSerializedFieldValues')->willReturn(['privateNotes' => 'Keep custom content']);

        return $address;
    }

    private function owner(array $addresses = []): array
    {
        $field = $this->addressField();
        $layout = $this->createMock(FieldLayout::class);
        $layout->method('getCustomFields')->willReturn([$field]);
        $element = $this->createMock(CraftEntry::class);
        $element->method('getFieldLayout')->willReturn($layout);
        $collection = $this->createMock(ElementCollection::class);
        $collection->method('all')->willReturnCallback(static function () use (&$addresses) { return $addresses; });
        $element->method('getFieldValue')->willReturn($collection);
        $saved = (object) ['value' => [], 'writes' => 0];
        $element->method('setFieldValue')->willReturnCallback(function ($handle, $value) use ($saved, &$addresses) {
            self::assertSame('address', $handle);
            $saved->value = $value;
            ++$saved->writes;
            $old = $addresses;
            $addresses = [];
            foreach ($value as $id => $data) {
                unset($data['fields']);
                // Craft loads saved address properties before applying serialized attributes.
                $data += ['firstName' => $old[0]->firstName ?? null, 'lastName' => $old[0]->lastName ?? null];
                $addresses[] = $this->address($data + ['id' => is_numeric($id) ? (int) $id : null]);
            }
        });

        return [$element, $saved];
    }
}
