<?php

namespace Solspace\Freeform\Tests\Services;

use PHPUnit\Framework\Attributes\CoversNothing;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Twig\Environment;
use Twig\Loader\ArrayLoader;
use Twig\TwigFilter;
use Twig\TwigFunction;

#[CoversNothing]
class ActivityAlertTemplateTest extends TestCase
{
    #[TestWith([5, 2, 30, 'error'])]
    #[TestWith([1, 0, 1, 'error'])]
    #[TestWith([0, 2, 14, 'warning'])]
    #[TestWith([0, 1, 7, 'warning'])]
    #[TestWith([0, 0, 30, null])]
    public function testBannerLinksToOpenEventsAndShowsActualRetention(int $errors, int $warnings, int $days, ?string $level): void
    {
        $twig = new Environment(new ArrayLoader([
            'banner' => file_get_contents(__DIR__.'/../../templates/_components/log-alert.twig'),
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
        $twig->addFunction(new TwigFunction('cpUrl', static fn ($path, $params = []) => '/admin/'.$path.'?'.http_build_query($params)));
        $html = $twig->render('banner', ['counts' => ['error' => $errors, 'warning' => $warnings], 'retentionDays' => $days]);
        if (null === $level) {
            self::assertSame('', trim($html));

            return;
        }
        $dom = new \DOMDocument();
        @$dom->loadHTML($html);
        $xpath = new \DOMXPath($dom);
        self::assertSame(1, $xpath->query('//div[@role="status" and @data-status="'.$level.'"]')->length);
        self::assertStringContainsString(1 === $days ? 'Recorded in the past day' : 'Recorded in the past '.$days.' days', $html);
        foreach (['error' => $errors, 'warning' => $warnings] as $severity => $count) {
            $links = $xpath->query('//a[@data-level="'.$severity.'"]');
            self::assertSame($count ? 1 : 0, $links->length);
            if (!$count) {
                continue;
            }
            parse_str(parse_url($links->item(0)->getAttribute('href'), \PHP_URL_QUERY), $params);
            self::assertSame(['view' => 'events', 'resolution' => 'open', 'level' => $severity] + ('warning' === $severity ? ['category' => 'system'] : []), $params);
            self::assertSame($count.' '.('error' === $severity ? (1 === $count ? 'error' : 'errors') : (1 === $count ? 'warning' : 'warnings')), trim($links->item(0)->textContent));
            self::assertStringContainsString('/status.svg#'.$severity, $html);
        }
    }
}
