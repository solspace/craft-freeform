<?php

namespace Solspace\Tests\Freeform\Unit\Library\Attributes;

use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\Attributes\FormAttributesCollection;

/**
 * @internal
 *
 * @coversNothing
 */
class FormAttributesCollectionTest extends TestCase
{
    public function testFormAttributes()
    {
        $attributes = new FormAttributesCollection([
            'novalidate' => true,
            'data-empty' => null,
            'row' => [
                'data-one' => 'one',
                'data-two' => 'two',
            ],
        ]);

        $this->assertCount(2, $attributes);
        $this->assertCount(2, $attributes->getRow());

        $this->assertSame(' novalidate data-empty', (string) $attributes);
        $this->assertSame(' data-one="one" data-two="two"', (string) $attributes->getRow());
    }
}
