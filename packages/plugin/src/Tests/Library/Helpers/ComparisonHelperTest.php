<?php

namespace Solspace\Freeform\Tests\Library\Helpers;

use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\Helpers\ComparisonHelper;

/**
 * @internal
 *
 * @coversNothing
 */
class ComparisonHelperTest extends TestCase
{
    public function textDataProvider(): array
    {
        return [
            ['(so$^me@*.com', '(so$^me@gmail.com', false],
            ['some*string', 'some  string', true],
            ['viagr*', 'viagra very more text', true],
            ['viagr*', 'some viagra1! text', true],
            ['viagr*', 'shviagra1!', false],
            ['viagr*', 'this long string contains viagra1! in it', true],
            ['viagr*', 'sviagra', false],
            ['vi*ra', 'viagra', true],
            ['vi*ra', 'viagarana ra', true],
            ['some@*.com', 'some@gmail.com', true],
            ['some@*.com', 'some@hotmail.com', true],
            ['some@*.com', 'some@gmail.ru', false],
            ['[some@*.com', '[some@gmail.com', false],
            ['[some@*.com', 'some@gmail.com', false],
            ['"Beautiful girls"', 'beautiful', false],
            ['"Beautiful girls"', 'girls', false],
            ['"Beautiful girls"', 'beautiful girls', true],
            ['"Beautiful girls"', 'flowers are beautiful', false],
            ['"Beautiful girls"', 'beautiful girls', true],
            ['"Beautiful girls"', 'too many beautiful girls', true],
            ['"Beautiful girls"', 'are there any beautiful girls in here', true],
            ['*@mail.me', 'some@mail.me', true],
            ['some@*.me', 'some@mail.me', true],
            ['some@mail.*', 'some@mail.me', true],
            ['+974', '974', true],
            ['+974', '+974', true],
            ['b*brides', 'bestbrides', true],
            ['*charming*', 'charmingdate', true],
        ];
    }

    /**
     * @dataProvider textDataProvider
     */
    public function testTextMatchesWildcardPattern(string $pattern, string $string, bool $expectedResult)
    {
        $result = ComparisonHelper::stringContainsWildcardKeyword($pattern, $string);

        $this->assertSame(
            $expectedResult,
            $result,
            sprintf(
                'Pattern "%s" returns "%s" for "%s". Expected: "%s"',
                $pattern,
                $result ? 'true' : 'false',
                $string,
                $expectedResult ? 'true' : 'false'
            )
        );
    }

    public function wordDataProvider(): array
    {
        return [
            ['(so$^me@*.com', '(so$^me@gmail.com', true],
            ['some*string', 'some  string', true],
            ['viagr*', 'viagra very more text', true],
            ['viagr*', 'viagra1! text', true],
            ['viagr*', 'shviagra1!', false],
            ['viagr*', 'this long string contains viagra1! in it', false],
            ['viagr*', 'sviagra', false],
            ['vi*ra', 'viagra', true],
            ['vi*ra', 'viagarana ra', true],
            ['some@*.com', 'some@gmail.com', true],
            ['some@*.com', 'some@hotmail.com', true],
            ['some@*.com', 'some@gmail.ru', false],
            ['[some@*.com', '[some@gmail.com', true],
            ['[some@*.com', 'some@gmail.com', false],
        ];
    }

    /**
     * @dataProvider wordDataProvider
     */
    public function testWordMatchesWildcardPattern(string $pattern, string $string, bool $expectedResult)
    {
        $result = ComparisonHelper::stringMatchesWildcard($pattern, $string);

        $this->assertSame(
            $expectedResult,
            $result,
            sprintf(
                'Pattern "%s" returns "%s" for "%s". Expected: "%s"',
                $pattern,
                $result ? 'true' : 'false',
                $string,
                $expectedResult ? 'true' : 'false'
            )
        );
    }
}
