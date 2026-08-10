<?php

namespace Solspace\Freeform\Tests\Bundles\GraphQL;

use GraphQL\Language\AST\BooleanValueNode;
use GraphQL\Language\AST\FloatValueNode;
use GraphQL\Language\AST\IntValueNode;
use GraphQL\Language\AST\ListValueNode;
use GraphQL\Language\AST\NameNode;
use GraphQL\Language\AST\NullValueNode;
use GraphQL\Language\AST\ObjectFieldNode;
use GraphQL\Language\AST\ObjectValueNode;
use GraphQL\Language\AST\StringValueNode;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Bundles\GraphQL\Types\FreeformJsonType;

#[CoversClass(FreeformJsonType::class)]
class FreeformJsonTypeTest extends TestCase
{
    private FreeformJsonType $type;

    protected function setUp(): void
    {
        $this->type = new FreeformJsonType();
    }

    public function testSerializePassesThrough(): void
    {
        $value = ['a' => 1, 'b' => ['c' => true]];

        self::assertSame($value, $this->type->serialize($value));
    }

    public function testParseValueAcceptsArray(): void
    {
        $value = ['email' => 'a@b.com'];

        self::assertSame($value, $this->type->parseValue($value));
    }

    public function testParseValueDecodesJsonString(): void
    {
        self::assertSame(
            ['intent' => 'submit'],
            $this->type->parseValue('{"intent":"submit"}')
        );
    }

    public function testParseLiteralObject(): void
    {
        $node = new ObjectValueNode([
            'fields' => [
                new ObjectFieldNode([
                    'name' => new NameNode(['value' => 'email']),
                    'value' => new StringValueNode(['value' => 'a@b.com']),
                ]),
                new ObjectFieldNode([
                    'name' => new NameNode(['value' => 'count']),
                    'value' => new IntValueNode(['value' => '3']),
                ]),
                new ObjectFieldNode([
                    'name' => new NameNode(['value' => 'ok']),
                    'value' => new BooleanValueNode(['value' => true]),
                ]),
                new ObjectFieldNode([
                    'name' => new NameNode(['value' => 'ratio']),
                    'value' => new FloatValueNode(['value' => '1.5']),
                ]),
                new ObjectFieldNode([
                    'name' => new NameNode(['value' => 'empty']),
                    'value' => new NullValueNode([]),
                ]),
            ],
        ]);

        self::assertSame(
            [
                'email' => 'a@b.com',
                'count' => 3,
                'ok' => true,
                'ratio' => 1.5,
                'empty' => null,
            ],
            $this->type->parseLiteral($node)
        );
    }

    public function testParseLiteralList(): void
    {
        $node = new ListValueNode([
            'values' => [
                new StringValueNode(['value' => 'a']),
                new IntValueNode(['value' => '2']),
            ],
        ]);

        self::assertSame(['a', 2], $this->type->parseLiteral($node));
    }
}
