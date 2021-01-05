<?php

namespace Solspace\Tests\Freeform\Unit\Library\Helpers;

use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\Helpers\SanitizeHelper;

/**
 * @internal
 * @coversNothing
 */
class SanitizeHelperTest extends TestCase
{
    public function testSanitizesString()
    {
        $result = SanitizeHelper::recursiveHtmlSpecialChars('<script />');
        $this->assertSame('&lt;script /&gt;', $result);
    }

    public function testSanitizesSingleDimensionArray()
    {
        $result = SanitizeHelper::recursiveHtmlSpecialChars(['<script />']);

        $this->assertEquals(['&lt;script /&gt;'], $result);
    }

    public function testSanitizesThreeDimensionArray()
    {
        $result = SanitizeHelper::recursiveHtmlSpecialChars(
            [
                '<script />',
                false,
                1,
                ['<script />', ['<script />']],
            ]
        );

        $this->assertEquals(
            [
                '&lt;script /&gt;',
                false,
                1,
                ['&lt;script /&gt;', ['&lt;script /&gt;']],
            ],
            $result
        );
    }

    public function testDoesNotSanitizeIntegers()
    {
        $this->assertSame(1, SanitizeHelper::recursiveHtmlSpecialChars(1));
    }

    public function testDoesNotSanitizeBooleans()
    {
        $this->assertFalse(SanitizeHelper::recursiveHtmlSpecialChars(false));
    }

    public function testSanitizesObjectValues()
    {
        $obj = new \stdClass();
        $obj->sanitizeMe = '<script />';

        $sanitized = new \stdClass();
        $sanitized->sanitizeMe = '&lt;script /&gt;';

        $this->assertEquals($sanitized, SanitizeHelper::recursiveHtmlSpecialChars($obj));
    }

    public function sanitizeDataProvider()
    {
        return [
            ['', ''],
            ['"test" in some.var', '"test" in some.var'],
            ['some.craft = "test"', 'some.craft = "test"'],
            ['craft.submissions', 'submissions'],
            ['some.craft = "test" and craft.submit', 'some.craft = "test"craft.submit'],
            ['some.craft = "test"|test(craft.submit)', 'some.craft = "test"|testsubmit)'],
            ['some.craft = "test"|craft', 'some.craft = "test"'],
        ];
    }

    /**
     * @dataProvider sanitizeDataProvider
     *
     * @param mixed $condition
     * @param mixed $expected
     */
    public function testSanitize($condition, $expected)
    {
        $this->assertSame($expected, SanitizeHelper::cleanUpTwigCondition($condition));
    }
}
