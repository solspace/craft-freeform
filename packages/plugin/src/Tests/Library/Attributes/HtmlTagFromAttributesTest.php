<?php

namespace Solspace\Freeform\Tests\Library\Attributes;

use craft\helpers\Html;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\Attributes\Attributes;

#[CoversClass(Html::class)]
#[CoversClass(Attributes::class)]
class HtmlTagFromAttributesTest extends TestCase
{
    public function testConvertsAttributesWhenUsingToHtmlTag()
    {
        $attributes = new Attributes();
        $attributes
            ->set('data-null', null)
            ->set('data-boolean', true)
            ->set('data-boolean-false', false)
            ->set('text', 'text value')
            ->set('empty-text', '')
            ->set('number-value', 123)
            ->set('void')
            ->set('array-value', ['one', 'two', 'three'])
        ;

        $this->assertEquals(
            ' data-null data-boolean text="text value" empty-text="" number-value="123" void array-value="one two three"',
            (string) $attributes
        );

        $this->assertEquals(
            '<div data-null data-boolean text="text value" empty-text="" number-value="123" void array-value="one two three">content</div>',
            Html::tag('div', 'content', $attributes->toHtmlTagArray())
        );
    }
}
