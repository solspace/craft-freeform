<?php

namespace Solspace\Freeform\Tests\Library\Compatibility;

use CraftCms\Cms\Support\Html;
use PHPUnit\Framework\Attributes\CoversNothing;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Twig\Filters\FreeformTwigFilters;
use Twig\Environment;
use Twig\Loader\ArrayLoader;
use Twig\TwigFilter;
use Twig\TwigFunction;

/**
 * @coversNothing
 */
#[CoversNothing]
class Craft6SecondaryNavigationTest extends TestCase
{
    public function testExportLayoutDoesNotDuplicateThePrimaryNavigation(): void
    {
        $xpath = $this->renderSidebar('export/_layout.twig', []);
        self::assertSame(0, $xpath->query('//craft-nav-item')->length);
    }

    public function testSettingsLayoutDoesNotDuplicateThePrimaryNavigation(): void
    {
        $xpath = $this->renderSidebar('_layouts/settings.twig', []);
        self::assertSame(0, $xpath->query('//craft-nav-item')->length);
    }

    public function testNotificationLayoutDoesNotDuplicateThePrimaryNavigation(): void
    {
        $xpath = $this->renderSidebar('notifications/_layout.twig', []);
        self::assertSame(0, $xpath->query('//craft-nav-item')->length);
    }

    private function renderSidebar(string $template, array $context): \DOMXPath
    {
        $root = \dirname(__DIR__, 3).'/templates';
        // Exercise the actual sidebar blocks without booting unrelated CP hooks.
        preg_match('/{% block sidebar %}(.*?){% endblock %}/s', file_get_contents($root.'/'.$template), $matches);
        $twig = new Environment(new ArrayLoader([
            'sidebar' => $matches[1],
            'freeform/_components/secondary-navigation' => file_get_contents($root.'/_components/secondary-navigation.twig'),
        ]));
        $twig->addExtension(new FreeformTwigFilters());
        $twig->addFilter(new TwigFilter('t', static fn (string $text): string => $text));
        $twig->addFunction(new TwigFunction('cpUrl', static fn (string $path): string => '/admin/'.$path));
        $twig->addFunction(new TwigFunction('attr', Html::renderTagAttributes(...), ['is_safe' => ['html']]));
        $twig->addFunction(new TwigFunction('ui', \CraftCms\Cms\ui(...), ['is_safe' => ['html']]));

        $dom = new \DOMDocument();
        $dom->loadHTML('<html><body>'.$twig->render('sidebar', $context).'</body></html>', \LIBXML_NOERROR | \LIBXML_NOWARNING);

        return new \DOMXPath($dom);
    }
}
