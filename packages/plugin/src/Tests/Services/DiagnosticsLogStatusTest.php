<?php

namespace Solspace\Freeform\Tests\Services;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Services\DiagnosticsService;
use Twig\Environment;
use Twig\Loader\ArrayLoader;

#[CoversClass(DiagnosticsService::class)]
class DiagnosticsLogStatusTest extends TestCase
{
    #[TestWith([0, 0, 'pass'])]
    #[TestWith([0, 2, 'warning'])]
    #[TestWith([1, 0, 'error'])]
    #[TestWith([5, 2, 'error'])]
    public function testLogFindingsKeepTheirSeverity(int $errors, int $warnings, string $severity): void
    {
        $previousApp = \Craft::$app;
        $twig = new Environment(new ArrayLoader(), ['autoescape' => 'html']);
        $view = new class($twig) {
            public function __construct(private Environment $twig) {}

            public function renderString($template, $variables): string
            {
                return $this->twig->createTemplate($template)->render($variables);
            }
        };
        \Craft::$app = new class($view) {
            public function __construct(public object $view) {}
        };

        try {
            $service = (new \ReflectionClass(DiagnosticsService::class))->newInstanceWithoutConstructor();
            $item = (new \ReflectionMethod($service, 'createLogStatusItem'))->invoke($service, 'Activity Log', '/admin/freeform/activity?resolution=open', $errors, $warnings);
            self::assertCount('error' === $severity ? 1 : 0, $item->getWarnings());
            self::assertCount('warning' === $severity ? 1 : 0, $item->getSuggestions());
            self::assertSame([], $item->getNotices());
            self::assertStringContainsString('diag-check is-'.$severity, (string) $item->getMarkup());
            self::assertStringContainsString('<b>'.($errors + $warnings).' item', (string) $item->getMarkup());
        } finally {
            \Craft::$app = $previousApp;
        }
    }
}
