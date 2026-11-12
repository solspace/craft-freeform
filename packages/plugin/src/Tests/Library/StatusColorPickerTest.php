<?php

namespace Solspace\Freeform\Tests\Library;

use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Models\StatusModel;
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

    #[TestWith(['red'])]
    #[TestWith(['white'])]
    #[TestWith(['gray'])]
    #[TestWith(['grey'])]
    #[TestWith(['light'])]
    #[TestWith(['turquoise'])]
    public function testExistingStatusColorsRemainSelectedWithoutChangingTheirStoredName(string $color): void
    {
        $source = file_get_contents(__DIR__.'/../../templates/statuses/edit.twig');
        preg_match('/{% set colorField %}(.*?){% endset %}/s', $source, $match);
        $twig = new Environment(new ArrayLoader(['picker' => $match[1]]), ['strict_variables' => true, 'autoescape' => 'html']);
        $twig->addFilter(new TwigFilter('t', static fn ($text) => $text));
        $previousApp = \Craft::$app;

        try {
            \Craft::$app = new class {
                public function getVersion(): string
                {
                    return '6.0.0-beta.1';
                }
            };
            $palette = (new StatusModel(['color' => $color]))->getColorPalette();
        } finally {
            \Craft::$app = $previousApp;
        }
        $styles = array_map(static fn ($name, $hex) => '--c-color-'.$name.'-fill-loud:'.$hex, array_keys($palette), $palette);
        $html = $twig->render('picker', ['status' => ['color' => $color], 'palette' => $palette, 'paletteStyles' => $styles]);
        self::assertStringContainsString('value="'.$color.'"', $html);
        self::assertStringContainsString('<craft-select-color', $html);
        self::assertStringContainsString('colors="'.htmlspecialchars(json_encode(array_keys($palette)), \ENT_QUOTES).'"', $html);
        foreach ($palette as $name => $hex) {
            self::assertStringContainsString('--c-color-'.$name.'-fill-loud:'.$hex, $html);
        }
    }
}
