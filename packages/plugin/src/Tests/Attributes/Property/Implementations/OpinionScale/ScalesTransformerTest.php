<?php

namespace Solspace\Freeform\Tests\Attributes\Property\Implementations\OpinionScale;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Attributes\Property\Implementations\OpinionScale\ScalesTransformer;

#[CoversClass(ScalesTransformer::class)]
class ScalesTransformerTest extends TestCase
{
    #[DataProvider('scaleDataProvider')]
    public function testTransform(mixed $input, array $expected, array $labels): void
    {
        $transformer = new ScalesTransformer();
        $scales = $transformer->transform($input);

        $this->assertSame($expected, $transformer->reverseTransform($scales));
        $this->assertSame($labels, array_map(static fn ($scale) => $scale->getLabel(), $scales));
    }

    public static function scaleDataProvider(): array
    {
        return [
            'normal rows' => [[['1', 'Poor'], ['2', 'Good']], [['1', 'Poor'], ['2', 'Good']], ['Poor', 'Good']],
            'null value' => [[[null, 'No answer']], [['', 'No answer']], ['No answer']],
            'null optional label' => [[['1', null]], [['1', '1']], ['1']],
            'missing optional label' => [[['1']], [['1', '1']], ['1']],
            'empty row' => [[[]], [['', '']], ['']],
            'blank row' => [[[null, null]], [['', '']], ['']],
            'numeric zero' => [[[0, null]], [['0', '0']], ['0']],
            'string zero' => [[['0', 'Zero']], [['0', 'Zero']], ['Zero']],
            'numeric values' => [[[1, 10]], [['1', '10']], ['10']],
            'AI generated rows' => [[['value' => '1', 'label' => 'Poor']], [['1', 'Poor']], ['Poor']],
            'named optional label' => [[['value' => '1', 'label' => null]], [['1', '1']], ['1']],
            'named null value' => [[['value' => null, 'label' => 'No answer']], [['', 'No answer']], ['No answer']],
            'invalid rows' => [[null, 'invalid', ['1', 'Good']], [['1', 'Good']], ['Good']],
            'null scales' => [null, [], []],
            'empty scales' => [[], [], []],
        ];
    }
}
