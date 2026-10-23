<?php

namespace Solspace\Freeform\Tests\Fields;

use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Fields\Implementations\Pro\LocationField;
use Solspace\Freeform\Form\Form;
use Twig\Environment;
use Twig\Loader\ArrayLoader;

/**
 * @coversNothing
 */
class SubmissionLocationFieldTest extends TestCase
{
    #[TestWith([true, 'Address Line 1'])]
    #[TestWith([false, 'Address'])]
    public function testAddressEditorKeepsAllValuesWithAnInactiveHiddenSearchAndGroupedComponents(bool $includeLine2, string $addressLabel): void
    {
        $field = $this->getMockBuilder(LocationField::class)->setConstructorArgs([$this->createMock(Form::class)])->onlyMethods(['translate'])->getMock();
        $field->method('translate')->willReturnCallback(static fn ($key, $default) => $default);
        (new \ReflectionProperty(LocationField::class, 'includedComponents'))->setValue($field, $includeLine2 ? ['line1', 'line2', 'city'] : ['line1', 'city']);
        $twig = new Environment(new ArrayLoader([
            'location' => file_get_contents(__DIR__.'/../../templates/submissions/fields/location.twig'),
            '_includes/forms' => '{% macro textField(options) %}<div class="field"><label for="{{ options.id }}" class="{{ options.required ? "required" : "" }}">{{ options.label }}</label><input id="{{ options.id }}" name="{{ options.name }}" value="{{ options.value }}"></div>{% endmacro %}',
        ]), ['autoescape' => 'html', 'strict_variables' => true]);
        $html = $twig->render('location', [
            'field' => ['handle' => 'address', 'label' => 'Location', 'addressFields' => 'included', 'componentLabels' => $field->getComponentLabels(), 'requiredComponents' => ['line1', 'city']],
            'submission' => ['address' => ['value' => ['search' => 'Selected "address"', 'line1' => '123 Main', 'city' => 'Winnipeg']]],
        ]);
        $document = new \DOMDocument();
        @$document->loadHTML($html);
        $xpath = new \DOMXPath($document);
        self::assertSame($addressLabel, $xpath->query('//label[@for="address-line1"]')->item(0)->textContent);
        self::assertSame('Location', $xpath->query('//fieldset[contains(@class, "group")]/legend')->item(0)->textContent);
        self::assertSame(7, $xpath->query('//fieldset//input')->length);
        self::assertSame(7, $xpath->query('//input')->length);
        self::assertSame('hidden', $xpath->query('//input[@name="address[search]"]')->item(0)->getAttribute('type'));
        self::assertSame('Selected "address"', $xpath->query('//input[@name="address[search]"]')->item(0)->getAttribute('value'));
        self::assertSame(6, $xpath->query('//div[@class="freeform-submission-location-components"]/div[@class="field"]')->length);
        self::assertSame(2, $xpath->query('//label[@class="required"]')->length);
        self::assertSame('Winnipeg', $xpath->query('//input[@name="address[city]"]')->item(0)->getAttribute('value'));
    }

    public function testMappedAddressKeepsStoredValuesWithoutDisplayingDuplicateComponents(): void
    {
        $twig = new Environment(new ArrayLoader([
            'location' => file_get_contents(__DIR__.'/../../templates/submissions/fields/location.twig'),
            '_includes/forms' => '',
        ]), ['autoescape' => 'html', 'strict_variables' => true]);
        $values = [
            'search' => 'Selected "address"',
            'line1' => '123 Main',
            'line2' => 'Suite 2',
            'city' => 'Winnipeg',
            'state' => 'Manitoba',
            'postalCode' => 'R3C 1A1',
            'country' => 'Canada',
        ];
        $html = $twig->render('location', [
            'field' => ['handle' => 'locationCustom', 'addressFields' => 'mapped', 'componentLabels' => LocationField::COMPONENTS],
            'submission' => ['locationCustom' => ['value' => $values]],
        ]);
        $document = new \DOMDocument();
        @$document->loadHTML($html);
        $xpath = new \DOMXPath($document);
        self::assertSame(0, $xpath->query('//fieldset | //label | //input[not(@type="hidden")]')->length);
        self::assertSame(7, $xpath->query('//input')->length);
        foreach ($values as $key => $value) {
            self::assertSame($value, $xpath->query('//input[@name="locationCustom['.$key.']"]')->item(0)->getAttribute('value'));
        }
    }
}
