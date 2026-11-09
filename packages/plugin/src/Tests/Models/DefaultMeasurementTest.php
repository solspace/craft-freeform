<?php

namespace Solspace\Freeform\Tests\Models;

use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\Categories\FieldProperties\SubCategories\Signature;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\Categories\FieldProperties\SubCategories\Table;

/**
 * @coversNothing
 */
class DefaultMeasurementTest extends TestCase
{
    public function testUnitsDoNotChangeExistingDefaultsOrTheirStoredShape(): void
    {
        $saved = [
            'width' => ['value' => '0', 'locked' => true],
            'height' => ['value' => '', 'locked' => false],
            'penDotSize' => ['value' => '2.5', 'locked' => true],
        ];
        $defaults = new Signature($saved);
        $serialized = $defaults->jsonSerialize();
        foreach ($saved as $name => $value) {
            self::assertSame('px', $defaults->{$name}->unit);
            self::assertSame($value['value'], $defaults->{$name}->getValue());
            self::assertSame($value['locked'], $defaults->{$name}->isLocked());
            self::assertEquals($value, $defaults->{$name}->toArray());
            self::assertEquals($value, $serialized[$name]);
        }
        $reloaded = new Signature(json_decode(json_encode($defaults), true));
        self::assertSame($serialized, $reloaded->jsonSerialize());
        self::assertSame('px', $reloaded->width->unit);
    }

    public function testCountsRetainEmptyAndZeroValuesAndTextRemainsUnitless(): void
    {
        $defaults = new Table([
            'minRows' => ['value' => '0', 'locked' => true],
            'maxRows' => ['value' => '', 'locked' => false],
        ]);
        self::assertSame('rows', $defaults->minRows->unit);
        self::assertSame('rows', $defaults->maxRows->unit);
        self::assertSame('rows', $defaults->exactRows->unit);
        self::assertSame('0', $defaults->minRows->getValue());
        self::assertSame('', $defaults->maxRows->getValue());
        self::assertNull($defaults->addButtonLabel->unit);
        self::assertSame('Add', $defaults->addButtonLabel->getValue());
    }
}
