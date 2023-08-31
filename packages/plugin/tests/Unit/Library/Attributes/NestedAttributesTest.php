<?php

namespace Solspace\Tests\Freeform\Unit\Library\Attributes;

use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\Attributes\Attributes;

/**
 * @internal
 *
 * @coversNothing
 */
class NestedAttributesTest extends TestCase
{
    public function testNestingFieldAttributes()
    {
        $attributes = new Attributes([
            'class' => 'class-name',
            '@fields' => [
                '@text' => [
                    'input' => [
                        'class' => 'text-class',
                        'placeholder' => 'text-placeholder',
                    ],
                ],
            ],
        ]);

        $this->assertEquals(' class="class-name"', (string) $attributes);
        $this->assertEquals(
            [
                '@text' => [
                    'input' => [
                        'class' => 'text-class',
                        'placeholder' => 'text-placeholder',
                    ],
                ],
            ],
            $attributes->getNested('fields')
        );
    }
}
