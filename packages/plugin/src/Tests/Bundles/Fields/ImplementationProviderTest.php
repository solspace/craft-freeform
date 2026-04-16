<?php

namespace Solspace\Freeform\Tests\Bundles\Fields;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Bundles\Fields\ImplementationProvider;

#[CoversClass(ImplementationProvider::class)]
class ImplementationProviderTest extends TestCase
{
    public function testExtractsImplementations(): void
    {
        $provider = new ImplementationProvider();
        $result = $provider->getImplementations(TestThis::class);

        $this->assertSame(
            ['testInterface1', 'anotherMultiWord', 'abrrTest'],
            $result,
        );
    }

    public function testGetsFromArray(): void
    {
        $provider = new ImplementationProvider();
        $result = $provider->getFromArray([
            TestInterface1::class,
            AnotherMultiWordInterface::class,
            ABRRTestInterface::class,
        ]);

        $this->assertSame(
            ['testInterface1', 'anotherMultiWord', 'abrrTest'],
            $result,
        );
    }
}

interface TestInterface1 {}
interface AnotherMultiWordInterface {}
interface ABRRTestInterface {}

class TestThis implements TestInterface1, AnotherMultiWordInterface, ABRRTestInterface {}
