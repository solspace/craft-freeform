<?php

namespace Solspace\Freeform\Tests\Fields;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionCollection;
use Solspace\Freeform\Attributes\Property\Input\Boolean;
use Solspace\Freeform\Fields\Implementations\DropdownField;
use Solspace\Freeform\Fields\Implementations\MultipleSelectField;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Attributes\FieldAttributesCollection;
use Solspace\Freeform\Services\Headless\Manifest\ManifestFieldSerializer;

#[CoversClass(DropdownField::class)]
#[CoversClass(MultipleSelectField::class)]
#[CoversClass(ManifestFieldSerializer::class)]
class SearchableSelectTest extends TestCase
{
    #[DataProvider('fieldTypes')]
    public function testSearchIsOptInAndDeclaredInBuilderMetadata(string $class, string $name): void
    {
        $field = (new \ReflectionClass($class))->newInstanceWithoutConstructor();
        self::assertFalse($field->isEnableSearch());
        self::assertFalse($field->getSearchableConfig()['enabled']);
        $property = new \ReflectionProperty($class, 'enableSearch');
        $attribute = $property->getAttributes(Boolean::class)[0]->getArguments();
        self::assertSame('Enable Search', $attribute['label']);
        $property->setValue($field, true);
        self::assertTrue($field->isEnableSearch());
        self::assertTrue($field->getSearchableConfig()['enabled']);
    }

    #[DataProvider('fieldTypes')]
    public function testRenderingPreservesNativeFieldsAndSafelyEncodesConfiguration(string $class, string $name): void
    {
        $field = $this->getMockBuilder($class)->disableOriginalConstructor()
            ->onlyMethods(['getAttributes', 'getIdAttribute', 'getHandle', 'getOptions', 'getRequiredAttribute', 'getSearchableConfig'])
            ->getMock()
        ;
        $field->method('getAttributes')->willReturn(new FieldAttributesCollection());
        $field->method('getIdAttribute')->willReturn('drink');
        $field->method('getHandle')->willReturn('drink');
        $field->method('getOptions')->willReturn((new OptionCollection())->add('tea', 'Tea'));
        $field->method('getRequiredAttribute')->willReturn('required');
        $config = ['enabled' => true, 'placeholder' => '" onfocus="alert(1) {{ 7 * 7 }} <script>'];
        $field->method('getSearchableConfig')->willReturn($config);
        $field->setValue('tea');
        self::assertStringNotContainsString('data-freeform-searchable', $field->getInputHtml());
        (new \ReflectionProperty($class, 'enableSearch'))->setValue($field, true);
        $html = $field->getInputHtml();
        $document = new \DOMDocument();
        $document->loadHTML($html);
        $select = $document->getElementsByTagName('select')->item(0);
        self::assertSame($name, $select->getAttribute('name'));
        self::assertTrue($select->hasAttribute('required'));
        self::assertSame(MultipleSelectField::class === $class, $select->hasAttribute('multiple'));
        self::assertSame($config, json_decode($select->getAttribute('data-freeform-searchable'), true, flags: \JSON_THROW_ON_ERROR));
        self::assertFalse($select->hasAttribute('onfocus'));
        self::assertSame(0, $document->getElementsByTagName('script')->length);
        self::assertTrue($document->getElementsByTagName('option')->item(0)->hasAttribute('selected'));
    }

    #[DataProvider('fieldTypes')]
    public function testHeadlessConfigurationMatchesClassicFields(string $class, string $name): void
    {
        $field = (new \ReflectionClass($class))->newInstanceWithoutConstructor();
        (new \ReflectionProperty($class, 'enableSearch'))->setValue($field, true);
        $serializer = (new \ReflectionClass(ManifestFieldSerializer::class))->newInstanceWithoutConstructor();
        $method = new \ReflectionMethod($serializer, 'serializeFrontendConfig');
        $form = $this->createMock(Form::class);
        self::assertSame(['searchable' => $field->getSearchableConfig()], $method->invoke($serializer, $form, $field));
    }

    public static function fieldTypes(): array
    {
        return [[DropdownField::class, 'drink'], [MultipleSelectField::class, 'drink[]']];
    }
}
