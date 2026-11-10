<?php

namespace Solspace\Freeform\Tests\Library;

use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\Helpers\ColorHelper;

/**
 * @coversNothing
 */
class ColorPaletteTest extends TestCase
{
    public function testNewFormsChooseAColorFromTheSharedCraftPalette(): void
    {
        $palette = ColorHelper::getPalette();
        self::assertCount(20, $palette);
        $colors = array_column(array_filter($palette, static fn (array $color) => $color['random']), 'value');
        self::assertCount(17, $colors);
        self::assertNotContains('#ffffff', $colors);
        self::assertNotContains('#000000', $colors);
        for ($i = 0; $i < 100; ++$i) {
            self::assertContains(ColorHelper::randomColor(), $colors);
        }
    }
}
