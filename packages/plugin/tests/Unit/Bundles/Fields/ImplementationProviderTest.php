<?php

namespace Solspace\Tests\Freeform\Unit\Bundles\Fields;

use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Bundles\Fields\ImplementationProvider;

/**
 * @internal
 *
 * @coversNothing
 */
class ImplementationProviderTest extends TestCase
{
    public function testExtractsImplementations()
    {
        $provider = new ImplementationProvider();
        $result = $provider->getImplementations(TestThis::class);

        $this->assertSame(
            ['testInterface1', 'anotherMultiWord'],
            $result,
        );
    }

    public function testGetsFromArray()
    {
        $provider = new ImplementationProvider();
        $result = $provider->getFromArray([
            TestInterface1::class,
            AnotherMultiWordInterface::class,
        ]);

        $this->assertSame(
            ['testInterface1', 'anotherMultiWord'],
            $result,
        );
    }
}

interface TestInterface1
{
}
interface AnotherMultiWordInterface
{
}

class TestThis implements TestInterface1, AnotherMultiWordInterface
{
}
