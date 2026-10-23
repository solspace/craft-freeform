<?php

namespace Solspace\Freeform\Tests\Fields;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Bundles\Fields\FieldRenderOptionsBundle;
use Solspace\Freeform\Events\Forms\SetPropertiesEvent;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Implementations\Pro\LocationField;
use Solspace\Freeform\Form\Bags\PropertyBag;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Attributes\FieldAttributesCollection;
use yii\base\Event;

#[CoversClass(LocationField::class)]
class LocationAttributesRenderingTest extends TestCase
{
    #[TestWith([false])]
    #[TestWith([true])]
    public function testRenderOptionsCustomizeMarkupWithoutChangingValuesOrRuntimeHooks(bool $formLevel): void
    {
        $form = $this->createMock(Form::class);
        $form->method('getProperties')->willReturn(new PropertyBag($form));
        $field = $this->getMockBuilder(LocationField::class)->setConstructorArgs([$form])->onlyMethods(['getAttributes', 'getLocationConfig', 'getHandle', 'getId', 'getIdAttribute', 'getLabel'])->getMock();
        $field->method('getId')->willReturn(42);
        $field->method('getHandle')->willReturn('address');
        $field->method('getIdAttribute')->willReturn('address-id');
        $field->method('getLabel')->willReturn('Location');
        $field->method('getAttributes')->willReturn(new FieldAttributesCollection(['input' => ['class' => 'base-input'], 'label' => ['class' => 'base-label']]));
        $field->method('getLocationConfig')->willReturn(['labels' => LocationField::COMPONENTS, 'showSearch' => true]);
        $field->setValue(['city' => 'Winnipeg']);
        (new \ReflectionProperty(LocationField::class, 'includedComponents'))->setValue($field, ['line1', 'city']);
        $options = [
            'locationLabelPosition' => 'after',
            'locationSearchLabel' => true,
            'locationAttributes' => [
                'wrapper' => ['=class' => 'address-shell', 'data-freeform-location' => 'invalid'],
                'searchContainer' => ['tag' => 'section', '=class' => 'lookup-shell'],
                'searchInput' => ['=class' => 'lookup-input', 'name' => 'incorrect', 'placeholder' => 'Custom lookup'],
                'searchLabel' => ['=class' => 'lookup-label'],
                'components' => ['tag' => 'section', '=class' => 'address-items', 'style' => 'display:flex;gap:20px;', 'hidden' => true, 'data-freeform-location-components' => false],
                'componentContainer' => ['tag' => 'section', '=class' => 'address-item-{{ component }}'],
                'componentInput' => ['=class' => 'address-control', 'placeholder' => 'Custom placeholder', 'name' => 'incorrect', 'data-location-component' => 'incorrect'],
                'componentLabel' => ['=class' => 'address-label', 'for' => 'incorrect'],
            ],
        ];
        $bundle = (new \ReflectionClass(FieldRenderOptionsBundle::class))->newInstanceWithoutConstructor();
        Event::on(FieldInterface::class, FieldInterface::EVENT_SET_PARAMETERS, [$bundle, 'onSetParameters']);
        Event::on(FieldInterface::class, FieldInterface::EVENT_COMPILE_ATTRIBUTES, [$bundle, 'compileAttributes']);

        try {
            if ($formLevel) {
                $bundle->processOptions(new SetPropertiesEvent($form, ['fields' => ['@location' => $options]]));
            } else {
                $field->setParameters($options);
            }
            $html = (new \ReflectionMethod(LocationField::class, 'getInputHtml'))->invoke($field);
        } finally {
            Event::off(FieldInterface::class, FieldInterface::EVENT_SET_PARAMETERS, [$bundle, 'onSetParameters']);
            Event::off(FieldInterface::class, FieldInterface::EVENT_COMPILE_ATTRIBUTES, [$bundle, 'compileAttributes']);
        }
        $document = new \DOMDocument();
        @$document->loadHTML($html);
        $xpath = new \DOMXPath($document);
        self::assertSame(7, $xpath->query('//input')->length);
        self::assertSame(1, $xpath->query('//div[@class="address-shell"][@data-freeform-location]')->length);
        self::assertSame(1, $xpath->query('//section[@class="lookup-shell"]/input[@class="lookup-input"]/following-sibling::label[@class="lookup-label"]')->length);
        self::assertSame('address[search]', $xpath->query('//input[@id="address-id"]')->item(0)->getAttribute('name'));
        self::assertSame('Custom lookup', $xpath->query('//input[@id="address-id"]')->item(0)->getAttribute('placeholder'));
        $group = $xpath->query('//section[@class="address-items"]')->item(0);
        self::assertTrue($group->hasAttribute('data-freeform-location-components'));
        self::assertFalse($group->hasAttribute('hidden'));
        self::assertSame('display: flex; gap: 20px;', $group->getAttribute('style'));
        self::assertSame(1, $xpath->query('//section[@class="address-item-city"]/input[@class="address-control"]')->length);
        $city = $xpath->query('//input[@id="address-id-city"]')->item(0);
        self::assertSame('Winnipeg', $city->getAttribute('value'));
        self::assertSame('address[city]', $city->getAttribute('name'));
        self::assertSame('city', $city->getAttribute('data-location-component'));
        self::assertSame('Custom placeholder', $city->getAttribute('placeholder'));
        self::assertSame('address-id-city', $xpath->query('//label[@class="address-label"][text()="City"]')->item(0)->getAttribute('for'));
        self::assertSame('base-input', $field->getAttributes()->getInput()->get('class'));
    }
}
