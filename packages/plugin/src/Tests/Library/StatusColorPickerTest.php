<?php

namespace Solspace\Freeform\Tests\Library;

use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Twig\Environment;
use Twig\Loader\ArrayLoader;
use Twig\TwigFilter;

/**
 * @coversNothing
 */
class StatusColorPickerTest extends TestCase
{
    #[TestWith(['red', 20])]
    #[TestWith(['white', 20])]
    #[TestWith(['grey', 21])]
    #[TestWith(['light', 21])]
    #[TestWith(['turquoise', 21])]
    public function testExistingStatusColorsRemainSelectedWithoutChangingTheirStoredName(string $color, int $count): void
    {
        $source = file_get_contents(__DIR__.'/../../templates/statuses/edit.twig');
        preg_match('/{% set colorField %}(.*?){% endset %}/s', $source, $match);
        $twig = new Environment(new ArrayLoader(['picker' => $match[1]]), ['strict_variables' => true, 'autoescape' => 'html']);
        $twig->addFilter(new TwigFilter('t', static fn ($text) => $text));
        $html = $twig->render('picker', [
            'status' => ['color' => $color, 'colorHex' => '#98a3ae'],
        ]);

        $document = new \DOMDocument();
        @$document->loadHTML($html);
        $xpath = new \DOMXPath($document);
        self::assertSame($count, $xpath->query('//input[@type="radio" and @name="color"]')->length);
        self::assertSame(1, $xpath->query('//input[@checked]')->length);
        self::assertSame($color, $xpath->query('//input[@checked]')->item(0)->getAttribute('value'));
        if (21 === $count) {
            self::assertSame('background-color:#98a3ae', $xpath->query('//input[@checked]/following-sibling::span')->item(0)->getAttribute('style'));
        }
    }
}
