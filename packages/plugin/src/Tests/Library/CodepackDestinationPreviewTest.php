<?php

namespace Solspace\Freeform\Tests\Library;

use PHPUnit\Framework\Attributes\CoversNothing;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Twig\Environment;
use Twig\Loader\ArrayLoader;
use Twig\TwigFilter;
use Twig\TwigFunction;

#[CoversNothing]
class CodepackDestinationPreviewTest extends TestCase
{
    #[TestWith(['/srv/project', '/srv/project/web/assets', 'web/assets'])]
    #[TestWith(['/srv/project', '/srv/project/public/assets', 'public/assets'])]
    #[TestWith(['/srv/project', '/srv/public_html/assets', 'webroot/assets'])]
    #[TestWith(['/srv/project', '/srv/project-other/web/assets', 'webroot/assets'])]
    #[TestWith(['/srv/project', '/symlink-target/web/assets', 'webroot/assets'])]
    #[TestWith(['', '/srv/project/web/assets', 'webroot/assets'])]
    #[TestWith(['C:\site', 'C:/site/web/assets', 'web/assets'])]
    public function testPathsOutsideTheProjectNeverExposeAbsoluteLocations(string $projectRoot, string $assetDirectory, string $expected): void
    {
        $twig = new Environment(new ArrayLoader([
            'destinations' => file_get_contents(__DIR__.'/../../templates/codepack/_destinations.twig'),
        ]), ['autoescape' => 'html', 'strict_variables' => true]);
        $twig->addFunction(new TwigFunction('alias', static fn () => $projectRoot));
        $twig->addFilter(new TwigFilter('t', static fn ($text) => $text));
        $html = $twig->render('destinations', [
            'codePack' => [
                'templates' => ['installDirectoryPath' => '/external/private-templates'],
                'assets' => ['installDirectoryPath' => $assetDirectory],
            ],
            'prefix' => 'demo-custom',
        ]);

        self::assertStringContainsString('<code>'.$expected.'/<span data-prefix>demo-custom</span>/</code>', $html);
        self::assertStringContainsString('<code>templates/<span data-prefix>demo-custom</span>/</code>', $html);
        self::assertStringNotContainsString('/srv/', $html);
        self::assertStringNotContainsString('/external/', $html);
        self::assertStringNotContainsString('/symlink-target/', $html);
        self::assertStringNotContainsString('C:', $html);
        self::assertStringNotContainsString('title=', $html);
        self::assertStringNotContainsString('data-install-base', $html);
    }
}
