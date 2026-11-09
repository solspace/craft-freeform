<?php

namespace Solspace\Freeform\Tests\Library\Activity;

use PHPUnit\Framework\Attributes\CoversNothing;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Twig\Environment;
use Twig\Loader\ArrayLoader;
use Twig\TwigFilter;
use Twig\TwigFunction;

#[CoversNothing]
class ActivityTemplateTest extends TestCase
{
    #[TestWith(['submissions'])]
    #[TestWith(['events'])]
    public function testActivityRendersWithCraft4HelpersAndAccessibleViewButtons(string $view): void
    {
        // Craft 4 has neither iconSvg() nor the forms.buttonGroup() macro.
        $twig = new Environment(new ArrayLoader([
            'activity' => file_get_contents(__DIR__.'/../../../templates/activity/index.twig'),
            'freeform/_layouts/main' => '{% block actionButton %}{% endblock %}{% block content %}{% endblock %}',
            '_includes/forms' => '{% macro selectize(config) %}<select name="{{ config.name }}"></select>{% endmacro %}{% macro selectField(config) %}{% endmacro %}',
            'freeform/activity/_results' => '<div data-activity-results></div>',
            'freeform/_components/confirmation-dialog' => '<dialog id="{{ id }}"></dialog>',
            'freeform/_components/log-alert' => '<div data-log-alert></div>',
        ]), ['strict_variables' => true, 'autoescape' => 'html']);
        $twig->addFilter(new TwigFilter('t', static fn ($text) => $text));
        $twig->addFilter(new TwigFilter('number', static fn ($number) => $number));
        $twig->addFunction(new TwigFunction('cpUrl', static fn ($path) => '/admin/'.$path));
        $twig->addFunction(new TwigFunction('actionUrl', static fn ($path) => '/actions/'.$path));
        $twig->addFunction(new TwigFunction('csrfInput', static fn () => ''));
        $twig->addFunction(new TwigFunction('hiddenInput', static fn ($name, $value) => \sprintf('<input type="hidden" name="%s" value="%s">', $name, $value), ['is_safe' => ['html']]));

        $html = $twig->render('activity', [
            'craft' => ['freeform' => ['name' => 'Freeform'], 'app' => ['request' => ['url' => '/admin/freeform/activity']]],
            'activityView' => $view,
            'canConfigure' => true,
            'canManage' => true,
            'throughId' => 12,
            'unavailable' => false,
            'activityEnabled' => true,
            'alertCounts' => ['error' => 5, 'warning' => 2],
            'alertRetentionDays' => 30,
            'settings' => ['activityMode' => 'minimal', 'activityRetentionDays' => 30],
            'filters' => ['q' => '', 'formId' => 0, 'category' => '', 'level' => '', 'resolution' => '', 'days' => 0, 'submissionId' => 0, 'view' => $view],
            'forms' => [1 => 'Contact'],
            'formColors' => [1 => '#7352d6'],
            'names' => ['submissions' => 'Submissions'],
            'levels' => ['error' => 'Error'],
            'exportLimit' => 1000,
        ]);

        $document = new \DOMDocument();
        @$document->loadHTML($html);
        $xpath = new \DOMXPath($document);
        self::assertSame(2, $xpath->query('//button[@name="view"]')->length);
        self::assertSame(1, $xpath->query('//button[@name="view" and @value="'.$view.'" and @aria-pressed="true"]')->length);
        self::assertSame(1, $xpath->query('//button[@name="view" and @aria-pressed="false"]')->length);
        self::assertSame(1, $xpath->query('//*[@id="activity-view" and @role="group" and @aria-label="Activity view"]')->length);
        self::assertStringContainsString('Configure Activity', $html);
        self::assertStringContainsString('Clear activity history', $html);
        self::assertStringContainsString('data-activity-results', $html);
        self::assertStringContainsString('data-log-alert', $html);
    }
}
