<?php

namespace Solspace\Tests\Freeform\Unit\Attributes\Property\Validators;

use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Attributes\Property\Validators\LengthValidator;
use Solspace\Freeform\Library\Composer\Components\FieldInterface;

/**
 * @internal
 *
 * @coversNothing
 */
class LengthValidatorTest extends TestCase
{
    public function testValidOnSameLength()
    {
        $validator = new LengthValidator(100);

        $mock = $this->createMock(FieldInterface::class);
        $mock
            ->expects($this->never())
            ->method('addError')
        ;

        $value = str_repeat('.', 100);

        $result = $validator->validate($mock, $value);

        $this->assertTrue($result);
    }

    public function testValidOnSmallerLength()
    {
        $validator = new LengthValidator(100);

        $mock = $this->createMock(FieldInterface::class);
        $mock
            ->expects($this->never())
            ->method('addError')
        ;

        $value = str_repeat('.', 99);

        $result = $validator->validate($mock, $value);

        $this->assertTrue($result);
    }

    public function testInvalidOnLargerLength()
    {
        $validator = new LengthValidator(100);

        $mock = $this->createMock(FieldInterface::class);
        $mock
            ->expects($this->once())
            ->method('addError')
            ->with('Value contains 101 characters, 100 allowed.')
        ;

        $value = str_repeat('.', 101);

        $result = $validator->validate($mock, $value);

        $this->assertFalse($result);
    }

    public function testCustomErrorMessage()
    {
        $validator = new LengthValidator(
            100,
            'This is max {max}, This is current {current}, this is max {max}'
        );

        $array = ['one', 'two', 'three'];

        $mock = $this->createMock(FieldInterface::class);
        $mock
            ->expects($this->once())
            ->method('addError')
            ->with('This is max 100, This is current 101, this is max 100')
        ;

        $value = str_repeat('.', 101);

        $result = $validator->validate($mock, $value);

        $this->assertFalse($result);
    }

    public function testDefaultsTo255()
    {
        $validator = new LengthValidator();

        $mock = $this->createMock(FieldInterface::class);
        $mock
            ->expects($this->once())
            ->method('addError')
            ->with('Value contains 256 characters, 255 allowed.')
        ;

        $value = str_repeat('.', 256);

        $result = $validator->validate($mock, $value);

        $this->assertFalse($result);
    }
}
