<?php

namespace Solspace\Freeform\Tests\Library;

use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\Helpers\ColorHelper;
use Solspace\Freeform\Tests\Helpers\UsesCraft6Container;
use Twig\Environment;
use Twig\Loader\ArrayLoader;
use Twig\TwigFilter;

/**
 * @coversNothing
 */
class StatusColorPickerTest extends TestCase
{
    use UsesCraft6Container;

    #[TestWith(['5.11.0', 'red', 20])]
    #[TestWith(['5.11.0', 'white', 20])]
    #[TestWith(['5.11.0', 'grey', 21])]
    #[TestWith(['5.11.0', 'light', 21])]
    #[TestWith(['5.11.0', 'turquoise', 21])]
    #[TestWith(['4.16.0', 'turquoise', 11])]
    #[TestWith(['4.16.0', 'red', 11])]
    public function testExistingStatusColorsRemainSelectedWithoutChangingTheirStoredName(string $version, string $color, int $count): void
    {
        $source = file_get_contents(__DIR__.'/../../templates/statuses/edit.twig');
        preg_match('/{% set colorField %}(.*?){% endset %}/s', $source, $match);
        $twig = new Environment(new ArrayLoader(['picker' => $match[1]]), ['strict_variables' => true, 'autoescape' => 'html']);
        $twig->addFilter(new TwigFilter('t', static fn ($text) => $text));
        $palette = ColorHelper::getPalette();
        $styles = array_map(static fn ($name, $hex) => '--c-color-'.$name.'-fill-loud:'.$hex, array_keys($palette), $palette);
        $html = $twig->render('picker', ['status' => ['color' => $color], 'palette' => $palette, 'paletteStyles' => $styles]);
        self::assertStringContainsString('model-value="'.$color.'"', $html);
        self::assertStringContainsString('<craft-select-color', $html);
        foreach ($palette as $name => $hex) {
            self::assertStringContainsString('--c-color-'.$name.'-fill-loud:'.$hex, $html);
        }
    }
}
