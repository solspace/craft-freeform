<?php

namespace Solspace\Freeform\Tests\Library\Helpers;

use craft\web\Request;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\Helpers\CsrfHelper;

#[CoversClass(CsrfHelper::class)]
class CsrfHelperTest extends TestCase
{
    #[TestWith(['session-token', 'session-token', true])]
    #[TestWith(['session-token', 'wrong-token', false])]
    #[TestWith(['session-token', null, false])]
    #[TestWith(['session-token', '', false])]
    #[TestWith(['session-token', ['session-token'], false])]
    #[TestWith([null, 'session-token', false])]
    #[TestWith(['', '', false])]
    public function testValidatesSessionToken(?string $expected, mixed $submitted, bool $valid): void
    {
        $request = $this->createMock(Request::class);
        $request->method('getCsrfToken')->willReturn($expected);
        $request->expects(self::never())->method('validateCsrfToken');

        self::assertSame($valid, CsrfHelper::validateToken($request, $submitted));
    }
}
