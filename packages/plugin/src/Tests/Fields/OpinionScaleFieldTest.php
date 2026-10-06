<?php

namespace Solspace\Freeform\Tests\Fields;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Attributes\Property\Implementations\OpinionScale\ScalesTransformer;
use Solspace\Freeform\Fields\Implementations\Pro\OpinionScaleField;
use Solspace\Freeform\Fields\Properties\OpinionScale\Scale;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Translations\TranslationTable;

#[CoversClass(OpinionScaleField::class)]
class OpinionScaleFieldTest extends TestCase
{
    public function testTranslatedScalesUseNormalizedValuesAndPreserveOrder(): void
    {
        $field = $this->getMockBuilder(OpinionScaleField::class)
            ->setConstructorArgs([$this->createMock(Form::class)])
            ->onlyMethods(['getTranslationTable'])
            ->getMock()
        ;
        $field->method('getTranslationTable')->willReturn(new TranslationTable([
            'scales' => [['2', 'Bien'], [0, null], ['value' => '1', 'label' => 'Mal']],
        ]));

        $property = new \ReflectionProperty(OpinionScaleField::class, 'scales');
        $property->setValue($field, [
            new Scale('0', 'Zero'),
            new Scale('1', 'Poor'),
            new Scale('2', 'Good'),
            new Scale('3', 'Excellent'),
        ]);

        $scales = $field->getScales();

        $this->assertSame([
            ['0', '0'], ['1', 'Mal'], ['2', 'Bien'], ['3', 'Excellent'],
        ], (new ScalesTransformer())->reverseTransform($scales));
        $this->assertSame('0', $scales[0]->getLabel());
    }
}
