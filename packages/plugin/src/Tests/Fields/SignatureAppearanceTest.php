<?php

namespace Solspace\Freeform\Tests\Fields;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Bundles\Attributes\Property\PropertyProvider;
use Solspace\Freeform\Fields\Implementations\Pro\SignatureField;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Attributes\FieldAttributesCollection;
use Solspace\Freeform\Library\Translations\TranslationTable;
use Solspace\Freeform\Services\Headless\Manifest\ManifestFieldSerializer;
use Solspace\Freeform\Tests\Fixtures\SignatureImages;

#[CoversClass(SignatureField::class)]
class SignatureAppearanceTest extends TestCase
{
    public function testNewCatalogDefaultsOffAndLegacyRecordsDefaultOn(): void
    {
        $provider = (new \ReflectionClass(PropertyProvider::class))->newInstanceWithoutConstructor();
        $property = new \ReflectionProperty(SignatureField::class, 'customizeAppearance');
        $catalog = $property->getAttributes(Input\Boolean::class)[0]->getArguments();
        self::assertFalse($catalog['value'], 'The builder, wizard, and generator read class catalog defaults.');

        $field = $this->field();
        self::assertTrue($property->getValue($field), 'Existing records without the setting keep custom appearance.');
        $provider->setObjectValue($field, 'customizeAppearance', null);
        self::assertTrue($field->isCustomizeAppearance());
        $provider->setObjectValue($field, 'customizeAppearance', false);
        self::assertFalse($property->getValue($field), 'An explicit false survives reloading.');
    }

    public function testTogglingAppearanceKeepsCustomValuesAndSavedSignaturesIntact(): void
    {
        $field = $this->field();
        foreach (['borderColor' => '#2468ac', 'backgroundColor' => '#000000', 'penColor' => '#ffffff'] as $key => $value) {
            (new \ReflectionProperty(SignatureField::class, $key))->setValue($field, $value);
        }
        $field->setValue(SignatureImages::PNG);
        self::assertSame('#000000', $field->getBackgroundColor());
        self::assertSame('#ffffff', $field->getPenColor());
        $mode = new \ReflectionProperty(SignatureField::class, 'customizeAppearance');
        $mode->setValue($field, false);
        self::assertSame('#999999', $field->getBorderColor());
        self::assertSame('rgba(0,0,0,0)', $field->getBackgroundColor());
        self::assertSame('#000000', $field->getPenColor());
        $mode->setValue($field, true);
        self::assertSame('#2468ac', $field->getBorderColor());
        self::assertSame('#000000', $field->getBackgroundColor());
        self::assertSame('#ffffff', $field->getPenColor());
        self::assertSame(SignatureImages::PNG, $field->getValue());
    }

    public function testPenCursorChoiceIsRetainedWhileAppearanceIsDisabled(): void
    {
        $field = $this->field();
        self::assertTrue($field->isShowPenCursor());
        (new \ReflectionProperty(SignatureField::class, 'showPenCursor'))->setValue($field, false);
        self::assertFalse($field->isShowPenCursor());
        $mode = new \ReflectionProperty(SignatureField::class, 'customizeAppearance');
        $mode->setValue($field, false);
        self::assertTrue($field->isShowPenCursor());
        $mode->setValue($field, true);
        self::assertFalse($field->isShowPenCursor());
    }

    #[TestWith([true])]
    #[TestWith([false])]
    public function testFrontendHooksExplicitlyIdentifyAppearanceInsteadOfGuessingFromColors(bool $custom): void
    {
        $field = $this->field();
        (new \ReflectionProperty(SignatureField::class, 'customizeAppearance'))->setValue($field, $custom);
        $html = (new \ReflectionMethod(SignatureField::class, 'getInputHtml'))->invoke($field);
        $document = new \DOMDocument();
        $previous = libxml_use_internal_errors(true);
        $document->loadHTML($html);
        libxml_clear_errors();
        libxml_use_internal_errors($previous);
        $canvas = $document->getElementsByTagName('canvas')->item(0);
        self::assertSame($custom ? 'true' : 'false', $canvas->getAttribute('data-signature-customize-appearance'));
        self::assertSame('true', $canvas->getAttribute('data-signature-pen-cursor'));
        self::assertFalse($canvas->hasAttribute('data-signature-normalize'));
        self::assertSame('#000000', $canvas->getAttribute('data-pen-color'));
        self::assertSame('rgba(0,0,0,0)', $canvas->getAttribute('data-background-color'));
    }

    public function testHeadlessManifestUsesTheSameAppearanceAndCursorDecisions(): void
    {
        $field = $this->field();
        (new \ReflectionProperty(SignatureField::class, 'penColor'))->setValue($field, '#2468ac');
        (new \ReflectionProperty(SignatureField::class, 'showPenCursor'))->setValue($field, false);
        $serializer = (new \ReflectionClass(ManifestFieldSerializer::class))->newInstanceWithoutConstructor();
        $serialize = new \ReflectionMethod(ManifestFieldSerializer::class, 'serializeFrontendConfig');
        $config = $serialize->invoke($serializer, $this->createMock(Form::class), $field);
        self::assertArrayNotHasKey('normalizeSignature', $config);
        self::assertTrue($config['customizeAppearance']);
        self::assertFalse($config['showPenCursor']);
        self::assertSame('#2468ac', $config['penColor']);
        (new \ReflectionProperty(SignatureField::class, 'customizeAppearance'))->setValue($field, false);
        $config = $serialize->invoke($serializer, $this->createMock(Form::class), $field);
        self::assertFalse($config['customizeAppearance']);
        self::assertTrue($config['showPenCursor']);
        self::assertSame('#000000', $config['penColor']);
    }

    private function field(): SignatureField
    {
        $field = $this->getMockBuilder(SignatureField::class)
            ->setConstructorArgs([$this->createMock(Form::class)])
            ->onlyMethods(['getTranslationTable', 'getAttributes', 'getHandle', 'getIdAttribute', 'getRequiredAttribute'])
            ->getMock()
        ;
        $field->method('getTranslationTable')->willReturn(new TranslationTable());
        $field->method('getAttributes')->willReturn(new FieldAttributesCollection());
        $field->method('getHandle')->willReturn('signature');
        $field->method('getIdAttribute')->willReturn('signature-pad');
        $field->method('getRequiredAttribute')->willReturn('');
        (new \ReflectionProperty(SignatureField::class, 'showClearButton'))->setValue($field, false);

        return $field;
    }
}
