<?php

namespace Solspace\Freeform\Tests\Library\Serialization;

use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\Serialization\FreeformSerializer;
use Solspace\Freeform\Library\Serialization\Normalizers\CustomNormalizerInterface;
use Solspace\Freeform\Library\Serialization\Normalizers\IdentificationNormalizer;
use Solspace\Freeform\Library\Serialization\Normalizers\IdentificatorInterface;

/**
 * @internal
 *
 * @coversNothing
 */
class FreeformSerializerTest extends TestCase
{
    public function testToArrayCustomNormalizer()
    {
        $serializer = new FreeformSerializer();
        $output = $serializer->serialize(new TestCustomArray(), 'json');

        $this->assertSame(
            '["Test string",true,123]',
            $output
        );
    }

    public function testToStringCustomNormalizer()
    {
        $serializer = new FreeformSerializer();
        $output = $serializer->serialize(new TestCustomString(), 'json');

        $this->assertSame(
            '"Test string"',
            $output
        );
    }

    public function testToIdentificatorOnContext()
    {
        $serializer = new FreeformSerializer();
        $output = $serializer->serialize(new TestToIdentifier(), 'json', [
            IdentificationNormalizer::NORMALIZE_TO_IDENTIFICATORS => true,
        ]);

        $this->assertSame(
            '123',
            $output
        );
    }

    public function testToDefaultWithNoIdentificatorContext()
    {
        $serializer = new FreeformSerializer();
        $output = $serializer->serialize(new TestToIdentifier(), 'json');

        $this->assertSame(
            '{"name":"Test","id":123,"data":[1,2,3]}',
            $output
        );
    }
}

class TestCustomArray implements CustomNormalizerInterface
{
    public string $test = 'Test string';
    public bool $bool = true;
    public int $int = 123;

    public function normalize(): array
    {
        return [$this->test, $this->bool, $this->int];
    }
}

class TestCustomString implements CustomNormalizerInterface
{
    public string $test = 'Test string';
    public bool $bool = true;
    public int $int = 123;

    public function normalize(): string
    {
        return $this->test;
    }
}

class TestToIdentifier implements IdentificatorInterface
{
    public string $name = 'Test';
    public int $id = 123;
    public array $data = [1, 2, 3];

    public function getNormalizeIdentificator(): null|int|string
    {
        return $this->id;
    }
}
