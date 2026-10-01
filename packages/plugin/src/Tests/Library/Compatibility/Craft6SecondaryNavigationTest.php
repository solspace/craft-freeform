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
    public function testExportSidebarUsesNativeSelectionForTheCurrentProfilePage(): void
    {
        $xpath = $this->renderSidebar('export/_layout.twig', [
            'currentUrl' => 'https://craft.test/admin/freeform/export/profiles/edit/42',
            'freeform' => ['plugin' => ['export' => ['navigation' => [
                ['heading' => 'Export'],
                ['title' => 'Profiles', 'url' => 'freeform/export/profiles'],
                ['title' => 'Notifications', 'url' => 'freeform/export/notifications'],
                ['heading' => 'Import'],
                ['title' => 'Freeform', 'url' => 'freeform/import/forms'],
            ]]]],
        ]);

        self::assertSame(2, $xpath->query('//craft-nav-item[@group]')->length);
        $this->assertSelectedLink($xpath, '/admin/freeform/export/profiles', 'Profiles');
    }

    public function testSettingsSidebarRetainsSelectionOnNestedEditPages(): void
    {
        $xpath = $this->renderSidebar('_layouts/settings.twig', [
            'segment3' => 'integrations',
            'segment4' => '42',
            'navItems' => [
                ['heading' => 'Settings'],
                'general' => ['title' => 'General'],
                'integrations' => ['title' => 'Integrations'],
            ],
        ]);

        $this->assertSelectedLink($xpath, '/admin/freeform/settings/integrations', 'Integrations');
    }

    public function testNotificationSidebarRespectsEnabledStorageAndCurrentPage(): void
    {
        $request = new class {
            public function segment(int $index): string
            {
                return 'database';
            }
        };
        $context = [
            'craft' => ['app' => ['request' => $request]],
            'freeform' => ['settings' => ['emailTemplateStorageType' => 'files_database']],
        ];
        $xpath = $this->renderSidebar('notifications/_layout.twig', $context);
        $this->assertSelectedLink($xpath, '/admin/freeform/notifications/database', 'Database Templates');
        self::assertSame(1, $xpath->query('//craft-nav-item[@href="/admin/freeform/notifications/files"]')->length);

        $context['freeform']['settings']['emailTemplateStorageType'] = 'files';
        $xpath = $this->renderSidebar('notifications/_layout.twig', $context);
        self::assertSame(0, $xpath->query('//craft-nav-item[@href="/admin/freeform/notifications/database"]')->length);
        self::assertSame(1, $xpath->query('//craft-nav-item[@href="/admin/freeform/notifications/wrappers"]')->length);
    }

    private function assertSelectedLink(\DOMXPath $xpath, string $href, string $title): void
    {
        $selected = $xpath->query('//craft-nav-item[@active and @current]');
        self::assertSame(1, $selected->length);
        self::assertSame($href, $selected->item(0)->getAttribute('href'));
        self::assertSame($title, trim($selected->item(0)->textContent));
        self::assertSame(0, $xpath->query('//a[contains(@class, "sel")]')->length);
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

        $dom = new \DOMDocument();
        $dom->loadHTML($twig->render('sidebar', $context), \LIBXML_NOERROR | \LIBXML_NOWARNING);

        return new \DOMXPath($dom);
    }
}
