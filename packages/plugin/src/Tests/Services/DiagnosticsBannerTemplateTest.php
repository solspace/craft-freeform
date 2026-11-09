<?php

namespace Solspace\Freeform\Tests\Services;

use PHPUnit\Framework\Attributes\CoversNothing;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Twig\Environment;
use Twig\Loader\ArrayLoader;
use Twig\TwigFilter;

#[CoversNothing]
class DiagnosticsBannerTemplateTest extends TestCase
{
    #[TestWith([1, 2, 1, 'error'])]
    #[TestWith([1, 0, 0, 'error'])]
    #[TestWith([0, 2, 1, 'warning'])]
    #[TestWith([0, 0, 1, 'notice'])]
    #[TestWith([0, 0, 0, 'success'])]
    public function testBannerUsesHighestSeverityAndKeepsEveryCountVisible(int $errors, int $warnings, int $notices, string $level): void
    {
        $twig = new Environment(new ArrayLoader([
            'banner' => file_get_contents(__DIR__.'/../../templates/settings/_diagnostics-banner.twig'),
            'freeform/_components/status-icon' => file_get_contents(__DIR__.'/../../templates/_components/status-icon.twig'),
        ]), ['strict_variables' => true, 'autoescape' => 'html']);
        $twig->addGlobal('craft', ['app' => ['assetManager' => new class {
            public function getPublishedUrl(...$args): string
            {
                return '/status.svg';
            }
        }]]);
        $twig->addFilter(new TwigFilter('t', static fn ($text, $category, $params = []) => strtr($text, array_combine(array_map(static fn ($key) => '{'.$key.'}', array_keys($params)), array_values($params)))));
        $twig->addFilter(new TwigFilter('number', static fn ($number) => $number));
        $html = $twig->render('banner', ['counts' => ['error' => $errors, 'warning' => $warnings, 'notice' => $notices]]);
        $dom = new \DOMDocument();
        @$dom->loadHTML($html);
        $xpath = new \DOMXPath($dom);
        self::assertSame(1, $xpath->query('//div[@role="status" and @data-status="'.$level.'"]')->length);
        foreach (['error' => $errors, 'warning' => $warnings, 'notice' => $notices] as $severity => $count) {
            self::assertSame($count ? 1 : 0, $xpath->query('//span[@data-status="'.$severity.'"]')->length);
            if ($count) {
                self::assertStringContainsString('/status.svg#'.$severity, $html);
            }
        }
        if ('success' === $level) {
            self::assertStringContainsString('No errors or warnings', $html);
            self::assertStringContainsString('/status.svg#success', $html);
        } else {
            self::assertStringNotContainsString('No errors or warnings', $html);
        }
        self::assertStringNotContainsString('Advisory', $html);
    }
}
