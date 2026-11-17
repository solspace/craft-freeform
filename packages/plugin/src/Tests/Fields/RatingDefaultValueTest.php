<?php

namespace Solspace\Freeform\Tests\Fields;

use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Attributes\Property\Input\Select;
use Solspace\Freeform\Fields\Implementations\Pro\RatingField;
use Solspace\Freeform\Form\Form;

/** @coversNothing */
class RatingDefaultValueTest extends TestCase
{
    public function testDefaultSelectionIsOptionalAndLimitedToTheAvailableStars(): void
    {
        $field = new RatingField($this->createMock(Form::class));
        self::assertSame('', $field->getDefaultValue());
        $property = new \ReflectionProperty(RatingField::class, 'defaultValue');
        self::assertCount(1, $property->getAttributes(Select::class));
        self::assertSame('None', $property->getAttributes(Select::class)[0]->newInstance()->emptyOption);
        $property->setValue($field, '4');
        self::assertSame('4', $field->getDefaultValue());
        (new \ReflectionProperty(RatingField::class, 'maxValue'))->setValue($field, 3);
        self::assertSame('', $field->getDefaultValue());
        foreach (['0', '-1', '11', 'invalid'] as $invalid) {
            $property->setValue($field, $invalid);
            self::assertSame('', $field->getDefaultValue());
        }
        (new \ReflectionProperty(RatingField::class, 'maxValue'))->setValue($field, 2);
        $property->setValue($field, '2');
        self::assertSame(2, $field->getMaxValue());
        self::assertCount(2, $field->getOptions());
        self::assertSame('2', $field->getDefaultValue());
        $property->setValue($field, '3');
        self::assertSame('', $field->getDefaultValue());
    }
}
