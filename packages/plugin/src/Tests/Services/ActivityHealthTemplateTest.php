<?php

namespace Solspace\Freeform\Tests\Services;

use PHPUnit\Framework\Attributes\CoversNothing;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Twig\Environment;
use Twig\Loader\ArrayLoader;
use Twig\TwigFilter;

#[CoversNothing]
class ActivityHealthTemplateTest extends TestCase
{
    #[TestWith([true, 'activity'])]
    #[TestWith([true, 'activity', 0])]
    #[TestWith([true, 'activity', 0, 0, true])]
    #[TestWith([true, 'activity', 0, 2])]
    #[TestWith([true, 'activity', 1, 0])]
    #[TestWith([true, 'activity', 2, 1])]
    #[TestWith([false, 'activity'])]
    #[TestWith([true, 'classic'])]
    #[TestWith([true, 'classic', 0])]
    #[TestWith([true, 'none'])]
    public function testWidgetReportsReadinessAndOnlyRendersAvailableData(bool $available, string $style, int $errors = 1, ?int $warnings = null, bool $recording = false): void
    {
        $warnings ??= $errors ? 2 : 0;
        $hasIssues = $errors || $warnings;
        $twig = new Environment(new ArrayLoader(['health' => file_get_contents(__DIR__.'/../../templates/_widgets/activity-health/body.html'), 'freeform/_components/status-icon' => file_get_contents(__DIR__.'/../../templates/_components/status-icon.twig')]), ['strict_variables' => true, 'autoescape' => 'html']);
        $twig->addGlobal('craft', ['app' => ['assetManager' => new class {
            public function getPublishedUrl(...$args): string
            {
                return '/status.svg';
            }
        }]]);
        $twig->addFilter(new TwigFilter('t', static fn ($text, $category, $params = []) => strtr($text, array_combine(array_map(static fn ($key) => '{'.$key.'}', array_keys($params)), array_values($params)))));
        $twig->addFilter(new TwigFilter('number', static fn ($number) => $number));
        $twig->addFilter(new TwigFilter('datetime', static fn ($date) => $date));
        $html = $twig->render('health', ['craft' => ['app' => ['request' => ['url' => '/health'], 'assetManager' => new class {
            public function getPublishedUrl(...$args): string
            {
                return '/status.svg';
            }
        }]], 'health' => ['available' => $available, 'style' => $style, 'days' => 7, 'requestedDays' => 30, 'retentionDays' => 7, 'mode' => 'minimal', 'errors' => $errors, 'warnings' => $warnings, 'errorUrl' => '/activity?level=error', 'warningUrl' => '/activity?level=warning', 'breakdown' => [['label' => 'Saved submissions', 'count' => 0, 'recording' => $recording, 'event' => 'submission']], 'recorded' => 3, 'trend' => [['count' => 3, 'height' => 100]], 'recent' => $errors ? [['title' => 'Known error', 'level' => 'error', 'date' => '2026-11-06 08:00:00', 'url' => '/event']] : [], 'links' => []]]);
        self::assertStringContainsString('data-freeform-health-ready="'.($available ? 'true' : 'false').'"', $html);
        if (!$available) {
            self::assertStringContainsString('Activity could not be loaded.', $html);
            self::assertStringNotContainsString('Unresolved errors', $html);
            self::assertStringNotContainsString('<strong>No errors or warnings</strong>', $html);
        } elseif ('none' === $style) {
            self::assertStringContainsString('Logging is turned off.', $html);
            self::assertStringNotContainsString('Unresolved errors', $html);
            self::assertStringNotContainsString('<strong>No errors or warnings</strong>', $html);
        } else {
            if ('activity' === $style) {
                if ($recording) {
                    self::assertStringNotContainsString('Not enabled', $html);
                    self::assertStringContainsString('<dd>0</dd>', $html);
                } else {
                    self::assertStringContainsString('Not enabled', $html);
                    self::assertStringContainsString('not enabled in Minimal logging mode', $html);
                }
                self::assertStringContainsString('3 events', $html);
                if ($hasIssues) {
                    self::assertStringContainsString('Spam and validation failures are excluded.', $html);
                }
                self::assertStringNotContainsString('>Operational warnings<', $html);
                if ($errors) {
                    self::assertLessThan(strpos($html, 'ff-health-breakdown'), strpos($html, 'ff-health-recent'));
                }
            }
            if ($hasIssues) {
                self::assertStringContainsString('>'.(1 === $errors ? 'Error' : 'Errors').'</span>', $html);
                self::assertStringContainsString('>'.(1 === $warnings ? 'Warning' : 'Warnings').'</span>', $html);
                self::assertStringNotContainsString('<strong>No errors or warnings</strong>', $html);
            } else {
                self::assertStringContainsString('<strong>No errors or warnings</strong>', $html);
                self::assertStringContainsString('role="status"', $html);
                self::assertStringNotContainsString('data-level="error"', $html);
                self::assertStringNotContainsString('data-level="warning"', $html);
                self::assertStringNotContainsString('ff-health-recent', $html);
            }
            self::assertStringNotContainsString('>Unresolved errors</span>', $html);
            self::assertStringNotContainsString('ff-health-period', $html);
            self::assertStringNotContainsString('ff-health-footer', $html);
            if (!$hasIssues) {
                self::assertStringNotContainsString('No unresolved issues recorded in this period.', $html);
                self::assertStringNotContainsString('No errors or warnings recorded in this period.', $html);
                self::assertStringNotContainsString('Needs attention', $html);
            }
            if ('activity' === $style) {
                self::assertStringContainsString('Limited to 7 days by retention settings.', $html);
            }
        }
    }
}
