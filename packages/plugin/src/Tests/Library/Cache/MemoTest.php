<?php

namespace Solspace\Freeform\Tests\Library\Cache;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\Cache\Memo;

#[CoversClass(Memo::class)]
class MemoTest extends TestCase
{
    public function testGetCachesValue(): void
    {
        $memo = new Memo();
        $calls = 0;

        $callback = static function () use (&$calls): string {
            ++$calls;

            return 'value';
        };

        $this->assertSame('value', $memo->getOrSet('key', $callback));
        $this->assertSame('value', $memo->getOrSet('key', $callback));
        $this->assertSame(1, $calls);
    }

    public function testPrefixScopesCachedValues(): void
    {
        $memo = new Memo();
        $calls = 0;

        $callback = static function () use (&$calls): string {
            return 'value-'.++$calls;
        };

        $this->assertSame('value-1', $memo->getOrSet('key', $callback, 'first'));
        $this->assertSame('value-1', $memo->getOrSet('key', $callback, '.first.'));
        $this->assertSame('value-2', $memo->getOrSet('key', $callback, 'second'));
        $this->assertSame(2, $calls);
    }

    public function testClearRemovesCachedValues(): void
    {
        $memo = new Memo();
        $calls = 0;

        $callback = static function () use (&$calls): string {
            return 'value-'.++$calls;
        };

        $this->assertSame('value-1', $memo->getOrSet('key', $callback));

        $memo->clear();

        $this->assertSame('value-2', $memo->getOrSet('key', $callback));
    }
}
