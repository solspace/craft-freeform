<?php

namespace Solspace\Freeform\Tests\Library\Helpers;

use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\Helpers\StringHelper;

/**
 * @internal
 *
 * @coversNothing
 */
class StringHelperTest extends TestCase
{
    public function testIncrementStringWithNoNumber()
    {
        $this->assertSame(
            'test string1',
            StringHelper::incrementStringWithNumber('test string')
        );
    }

    public function testIncrementStringWithNumber()
    {
        $this->assertSame(
            'test string154',
            StringHelper::incrementStringWithNumber('test string153')
        );
    }

    public function testIncrementStringWithNoNumberSpaced()
    {
        $this->assertSame(
            'test string 1',
            StringHelper::incrementStringWithNumber('test string', true)
        );
    }

    public function testIncrementStringSpaced()
    {
        $this->assertSame(
            'test string 154',
            StringHelper::incrementStringWithNumber('test string 153', true)
        );
    }

    public function separatedValuesProvider(): array
    {
        return [
            ['one two three', ['one', 'two', 'three']],
            ["one\ntwo\n\rthree", ['one', 'two', 'three']],
            ['one,two,three', ['one', 'two', 'three']],
            ['one,two "three four"', ['one', 'two', '"three four"']],
            ["one 'two three' four", ['one', "'two three'", 'four']],
            ["one 'two \"three' four", ['one', '\'two "three\'', 'four']],
            ['one@goog"le#.-=!?+_: test', ['one@goog"le#.-=!?+_:', 'test']],
            ['one;two;three', ['one', 'two', 'three']],
            ['one,two,three', ['one', 'two', 'three']],
            ['one|two|three', ['one', 'two', 'three']],
            ['one,| two|;three', ['one', 'two', 'three']],
        ];
    }

    /**
     * @dataProvider separatedValuesProvider
     *
     * @param mixed $input
     * @param mixed $expected
     */
    public function testExtractSeparatedValues($input, $expected)
    {
        $result = StringHelper::extractSeparatedValues($input);
        $this->assertSame(
            $expected,
            $result,
            sprintf("Failed to extract separated values from \"%s\"\nGot %s", $input, json_encode($result, \JSON_PRETTY_PRINT))
        );
    }
}
