<?php

namespace Solspace\Freeform\Tests\Library\Integrations\OAuth;

use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\Integrations\OAuth\CallbackOrigin;

/**
 * @coversNothing
 */
class CallbackOriginTest extends TestCase
{
    public function testCallbackMustReturnToCurrentOrigin(): void
    {
        foreach ([
            ['https://craft5.test/freeform/oauth/callback', 'https://craft5.test', true],
            ['https://CRAFT5.test:443/callback', 'https://craft5.test', true],
            ['http://localhost:3100/callback', 'http://localhost:3100', true],
            ['https://craft5upgrade.test/callback', 'https://craft5.test', false],
            ['http://craft5.test/callback', 'https://craft5.test', false],
            ['https://craft5.test:444/callback', 'https://craft5.test', false],
            ['https://craft5.test.evil.test/callback', 'https://craft5.test', false],
            ['https://user:secret@craft5.test/callback', 'https://craft5.test', false],
            ['/callback', 'https://craft5.test', false],
            ['', 'https://craft5.test', false],
        ] as [$callback, $origin, $expected]) {
            self::assertSame($expected, CallbackOrigin::matches($callback, $origin));
        }
    }
}
