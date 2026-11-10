<?php

namespace Solspace\Freeform\Tests\Attributes;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Attributes\Property\Implementations\FieldMapping\FieldMapItem;
use Solspace\Freeform\Attributes\Property\Implementations\FieldMapping\FieldMapping;
use Solspace\Freeform\Events\Integrations\CrmIntegrations\ProcessValueEvent;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Implementations\Pro\LocationField;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Integrations\Other\Google\GoogleSheets\EventListeners\GoogleSheetsValueTransformers;
use Solspace\Freeform\Integrations\PaymentGateways\Stripe\Stripe;
use Solspace\Freeform\Library\Helpers\LocationMappingHelper;
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;
use Solspace\Freeform\Library\Integrations\Types\Other\GoogleSheetsIntegrationInterface;
use yii\base\Event;

#[CoversClass(FieldMapItem::class)]
#[CoversClass(FieldMapping::class)]
#[CoversClass(LocationField::class)]
#[CoversClass(LocationMappingHelper::class)]
class FieldMapItemLocationTest extends TestCase
{
    public function testComponentsResolveFromOneLocationWithoutChangingItsStoredValue(): void
    {
        [$form, $field] = $this->fixture();
        $values = ['line1' => '123 Main Street', 'line2' => 'Suite 2', 'city' => 'Winnipeg', 'state' => 'Manitoba', 'postalCode' => 'R3C 1A2', 'country' => 'Canada'];
        $field->setValue($values);
        foreach ($values + ['countryCode' => 'CA', 'stateCode' => 'MB', 'fullAddress' => '123 Main Street, Suite 2, Winnipeg, Manitoba, R3C 1A2, Canada'] as $component => $expected) {
            $item = $this->item('location-uid.'.$component);
            self::assertSame($expected, $item->extractValue($form));
            self::assertSame($field, $item->getField($form));
        }
        self::assertSame($values, $field->getValue());
        self::assertSame($values, $this->item('location-uid')->extractValue($form));
    }

    public function testEmptyMissingAndInvalidReferencesNeverExposeOtherFieldProperties(): void
    {
        [$form] = $this->fixture();
        self::assertSame('', $this->item('location-uid.city')->extractValue($form));
        self::assertSame('', $this->item('location-uid.countryCode')->extractValue($form));
        self::assertNull($this->item('missing.city')->extractValue($form));
        self::assertNull($this->item('location-uid.form')->extractValue($form));
        self::assertNull($this->item('location-uid.city.value')->extractValue($form));
        $text = $this->createConfiguredMock(FieldInterface::class, ['getValue' => ['city' => 'Not a Location']]);
        $form = $this->createMock(Form::class);
        $form->method('get')->willReturn($text);
        self::assertNull($this->item('text-uid.city')->extractValue($form));
    }

    public function testCodesHandleCodesNamesCaseWhitespaceAndUnknownValues(): void
    {
        self::assertSame('CA', LocationMappingHelper::countryCode(' ca '));
        self::assertSame('US', LocationMappingHelper::countryCode('United States'));
        self::assertSame('QC', LocationMappingHelper::stateCode('Québec', 'Canada'));
        self::assertSame('MB', LocationMappingHelper::stateCode(' mb ', 'CA'));
        self::assertSame('CA', LocationMappingHelper::stateCode('California', 'US'));
        self::assertSame('', LocationMappingHelper::countryCode('Unknown country'));
        self::assertSame('', LocationMappingHelper::stateCode('Manitoba', 'Unknown country'));
        self::assertSame('', LocationMappingHelper::stateCode('Invalid region', 'CA'));
    }

    public function testCountryNamesCanUseTheCurrentSiteLanguage(): void
    {
        $previousApp = \Craft::$app;

        try {
            \Craft::$app = (object) ['language' => 'fr-CA'];
            self::assertSame('US', LocationMappingHelper::countryCode('États-Unis'));
            self::assertSame('DE', LocationMappingHelper::countryCode('Germany'));
        } finally {
            \Craft::$app = $previousApp;
        }
    }

    public function testPrefillingMergesComponentsAndSupportsClearingWithoutLosingOtherValues(): void
    {
        [$form, $field] = $this->fixture();
        $field->setValue(['line1' => 'Keep Street', 'city' => 'Old City']);
        $this->item('location-uid.city')->populateFieldValue($form, 'Winnipeg');
        $this->item('location-uid.countryCode')->populateFieldValue($form, 'CA');
        $this->item('location-uid.stateCode')->populateFieldValue($form, 'MB');
        self::assertSame(['line1' => 'Keep Street', 'city' => 'Winnipeg', 'state' => 'MB', 'country' => 'CA'], $field->getValue());
        $this->item('location-uid.city')->populateFieldValue($form, null);
        self::assertSame('', $field->getValue()['city']);
        self::assertSame('Keep Street', $field->getValue()['line1']);
    }

    public function testValidationReferencesUseParentUidWhileSavedMappingsKeepTheComponent(): void
    {
        $mapping = (new FieldMapping())->add('address.locality', FieldMapItem::TYPE_RELATION, 'location-uid.city');
        self::assertSame(['address.locality' => 'location-uid'], iterator_to_array($mapping->sourceToFieldUid()));
        self::assertSame('location-uid.city', $mapping->normalize()->{'address.locality'}->getValue());
        self::assertSame('0', (new FieldMapItem(FieldMapItem::TYPE_PRESET, 'count', '0'))->extractValue($this->createMock(Form::class)));
    }

    public function testGoogleSheetsAcceptsScalarLocationComponentsAndStillFormatsWholeValues(): void
    {
        [$form, $field] = $this->fixture();
        $integration = $this->createMock(GoogleSheetsIntegrationInterface::class);
        $transformer = new GoogleSheetsValueTransformers();

        try {
            $event = new ProcessValueEvent($integration, $form, new FieldObject('city', 'City', 'string', 'sheet'), $field, 'Winnipeg');
            $transformer->transformArrayValues($event);
            self::assertSame('Winnipeg', $event->getValue());
            $event->setValue(['123 Main', 'Winnipeg']);
            $transformer->transformArrayValues($event);
            self::assertSame('123 Main, Winnipeg', $event->getValue());
        } finally {
            Event::off(GoogleSheetsIntegrationInterface::class, GoogleSheetsIntegrationInterface::EVENT_PROCESS_VALUE, [$transformer, 'transformArrayValues']);
        }
    }

    public function testDuplicatedMappingsRetainTheirComponentAndUseTheNewFieldUid(): void
    {
        $map = ['old-location' => 'new-location', 'old-text' => 'new-text'];
        self::assertSame('new-location.countryCode', FieldMapItem::remapReference('old-location.countryCode', $map));
        self::assertSame('new-location', FieldMapItem::remapReference('old-location', $map));
        self::assertSame('new-text', FieldMapItem::remapReference('old-text', $map));
        self::assertSame('missing.city', FieldMapItem::remapReference('missing.city', $map));
    }

    public function testStripeRefreshesComponentMappingsUsingTheCompleteForm(): void
    {
        [$form] = $this->fixture();
        $stripe = (new \ReflectionClass(Stripe::class))->newInstanceWithoutConstructor();
        (new \ReflectionProperty(Stripe::class, 'addressMapping'))->setValue(
            $stripe,
            (new FieldMapping())
                ->add('city', FieldMapItem::TYPE_RELATION, 'location-uid.city')
                ->add('country', FieldMapItem::TYPE_RELATION, 'location-uid.countryCode')
        );
        self::assertSame([['source' => 'city'], ['source' => 'country']], $stripe->getMappedFieldHandles($form));
    }

    private function item(string $reference): FieldMapItem
    {
        return new FieldMapItem(FieldMapItem::TYPE_RELATION, 'destination', $reference);
    }

    private function fixture(): array
    {
        $form = $this->createMock(Form::class);
        $field = new LocationField($form);
        $form->method('get')->willReturnCallback(static fn ($uid) => 'location-uid' === $uid ? $field : null);

        return [$form, $field];
    }
}
