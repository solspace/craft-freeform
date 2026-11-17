<?php

namespace Solspace\Freeform\Tests\Services;

use PHPUnit\Framework\Attributes\CoversNothing;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Models\Settings;
use Solspace\Freeform\Services\DiagnosticsService;
use Twig\Environment;
use Twig\Loader\ArrayLoader;

#[CoversNothing]
class DiagnosticsActivityLoggingTest extends TestCase
{
    public function testReportShowsTheEffectiveLoggingModeWithoutLosingPausedPreferences(): void
    {
        $previousApp = \Craft::$app;
        $view = new class {
            public function renderString($template, $variables): string
            {
                return (new Environment(new ArrayLoader()))->createTemplate($template)->render($variables);
            }
        };
        \Craft::$app = new class($view) {
            public function __construct(public object $view) {}
        };

        try {
            $service = (new \ReflectionClass(DiagnosticsService::class))->newInstanceWithoutConstructor();
            $method = new \ReflectionMethod($service, 'createActivityLoggingItem');
            foreach ([
                ['minimal', 'activity', '1', 'Minimal'],
                ['standard', 'activity', '1', 'Standard'],
                ['detailed', 'activity', '1', 'Detailed'],
                ['custom', 'activity', '1', 'Custom'],
                ['custom', 'none', '1', 'Off'],
                ['detailed', 'activity', '0', 'Off'],
            ] as [$mode, $style, $enabled, $label]) {
                $settings = (new \ReflectionClass(Settings::class))->newInstanceWithoutConstructor();
                $settings->activityMode = $mode;
                $settings->loggingStyle = $style;
                $settings->activityEnabled = $enabled;
                $item = $method->invoke($service, $settings);

                self::assertStringContainsString('Activity Logging: <b>'.$label.'</b>', (string) $item->getMarkup());
                self::assertSame($mode, $settings->activityMode);
            }
        } finally {
            \Craft::$app = $previousApp;
        }
    }
}
