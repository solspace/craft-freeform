<?php

namespace Solspace\Freeform\Tests\Attributes\Property\Validators;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Attributes\Property\Validators\ReservedWord;

#[CoversClass(ReservedWord::class)]
class ReservedWordValidatorTest extends TestCase
{
    public function testValidOnNonReservedWord(): void
    {
        $validator = new ReservedWord();

        $result = $validator->validate('firstName');

        $this->assertEmpty($result);
    }

    public function testInvalidOnReservedWord(): void
    {
        $validator = new ReservedWord();

        $result = $validator->validate('url');

        $this->assertSame(['Value is a reserved word.'], $result);
    }

    public function testCustomErrorMessage(): void
    {
        $validator = new ReservedWord('You cannot use Craft reserved words as handles.');

        $result = $validator->validate('parent');

        $this->assertSame(
            ['You cannot use Craft reserved words as handles.'],
            $result
        );
    }
}
