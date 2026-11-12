<?php

namespace Solspace\Freeform\Tests\Library\Compatibility;

use CraftCms\Cms\Cp\Components\Tabs;
use PHPUnit\Framework\Attributes\CoversNothing;
use PHPUnit\Framework\TestCase;
use Twig\Environment;
use Twig\Loader\ArrayLoader;
use Twig\TwigFilter;
use Twig\TwigFunction;

#[CoversNothing]
class Craft6SubmissionTabsTest extends TestCase
{
    public function testMultiPageSubmissionRendersNamedNativeTabs(): void
    {
        $html = $this->render([
            ['label' => 'Contact details', 'index' => 0],
            ['label' => 'Message', 'index' => 1],
        ]);

        self::assertStringContainsString('label="Submission pages"', $html);
        self::assertStringContainsString('Contact details', $html);
        self::assertStringContainsString('Message', $html);
        self::assertStringContainsString('tab-0', $html);
        self::assertStringContainsString('tab-1', $html);
    }

    public function testSinglePageSubmissionDoesNotRenderTabs(): void
    {
        self::assertSame('', trim($this->render([['label' => 'Page 1', 'index' => 0]])));
    }

    private function render(array $pages): string
    {
        $template = file_get_contents(__DIR__.'/../../../templates/submissions/edit.twig');
        // Exercise the production page strip with Craft's actual tab component.
        preg_match('/{% if layout\.pages\|length > 1 %}.*?{% endif %}/s', $template, $matches);
        self::assertNotEmpty($matches);
        $twig = new Environment(new ArrayLoader(['tabs' => $matches[0]]), ['autoescape' => 'html']);
        $twig->addFilter(new TwigFilter('t', static fn ($text) => $text));
        $twig->addFunction(new TwigFunction('ui', static fn ($type, $config) => Tabs::make()->configure($config)->toHtml(), ['is_safe' => ['html']]));

        return $twig->render('tabs', ['layout' => ['pages' => $pages]]);
    }
}
