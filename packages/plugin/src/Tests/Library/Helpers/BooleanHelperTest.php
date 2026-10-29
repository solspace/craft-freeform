<?php

namespace Solspace\Freeform\Tests\Library\Helpers;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\Helpers\BooleanHelper;

#[CoversClass(BooleanHelper::class)]
class BooleanHelperTest extends TestCase
{
    public function testFalseStringsAreNotTruthy(): void
    {
        foreach (['false', 'FALSE', 'no', 'off', '0', '', false, 0, null] as $value) {
            self::assertFalse(BooleanHelper::normalize($value));
        }
        foreach (['true', 'TRUE', 'yes', 'on', '1', true, 1] as $value) {
            self::assertTrue(BooleanHelper::normalize($value));
        }
    }

    public function testEnvironmentVariablesUseTheSameNormalization(): void
    {
        $name = 'FREEFORM_BOOLEAN_VISIBILITY_TEST';
        $original = getenv($name);

        try {
            foreach (['false' => false, 'off' => false, 'true' => true, 'yes' => true] as $value => $expected) {
                putenv($name.'='.$value);
                self::assertSame($expected, BooleanHelper::normalize('$'.$name));
            }
            putenv($name);
            self::assertFalse(BooleanHelper::normalize('$'.$name));
        } finally {
            putenv(false === $original ? $name : $name.'='.$original);
        }
    }
}
