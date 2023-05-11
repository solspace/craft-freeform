<?php

namespace Solspace\Tests\Freeform\Unit\Fields\Properties\Options\Custom;

use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionsTransformer;
use Solspace\Freeform\Fields\Properties\Options\Custom\CustomOptions;

/**
 * @internal
 *
 * @coversNothing
 */
class CustomOptionsTest extends TestCase
{
    public function testTransform()
    {
        $value = [
            'source' => 'customOptions',
            'useCustomValues' => true,
            'options' => [
                ['label' => 'Checked option', 'value' => 'checkedOption', 'checked' => true],
                ['label' => 'Unchecked option', 'value' => 'uncheckedOption', 'checked' => false],
            ],
        ];

        $output = (new OptionsTransformer())->transform($value);

        $expected = new CustomOptions(
            [
                ['label' => 'Checked option', 'value' => 'checkedOption', 'checked' => true],
                ['label' => 'Unchecked option', 'value' => 'uncheckedOption', 'checked' => false],
            ],
            true,
        );

        $this->assertEquals($expected, $output);
    }

    public function testReverseTransform()
    {
        $value = new CustomOptions(
            [
                ['label' => 'Checked option', 'value' => 'checkedOption', 'checked' => true],
                ['label' => 'Unchecked option', 'value' => 'uncheckedOption', 'checked' => false],
            ],
            true,
        );

        $output = (new OptionsTransformer())->reverseTransform($value);

        $expected = [
            'source' => 'customOptions',
            'useCustomValues' => true,
            'options' => [
                ['label' => 'Checked option', 'value' => 'checkedOption', 'checked' => true],
                ['label' => 'Unchecked option', 'value' => 'uncheckedOption', 'checked' => false],
            ],
        ];

        $this->assertEquals($expected, $output);
    }
}
