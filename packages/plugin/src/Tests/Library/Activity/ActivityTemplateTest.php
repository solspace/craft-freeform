<?php

namespace Solspace\Freeform\Tests\Library\Activity;

use PHPUnit\Framework\Attributes\CoversNothing;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\Activity\ActivityPresentation;
use Twig\Environment;
use Twig\Loader\ArrayLoader;
use Twig\TwigFilter;
use Twig\TwigFunction;

#[CoversNothing]
class ActivityTemplateTest extends TestCase
{
    #[TestWith([false, true])]
    #[TestWith([true, true])]
    #[TestWith([false, false])]
    public function testResolutionActionsRemainScopedAndPermissionGatedInTheHeader(bool $resolved, bool $canManage): void
    {
        $twig = new Environment(new ArrayLoader([
            'results' => file_get_contents(__DIR__.'/../../../templates/activity/_results.twig'),
            'freeform/_components/activity-glyph' => '{% macro glyph(event, level) %}<span data-level="{{ level }}" class="ff-activity-glyph"></span>{% endmacro %}',
            '_includes/pagination' => '',
        ]), ['strict_variables' => true, 'autoescape' => 'html']);
        foreach (['t', 'number', 'hash', 'date', 'time', 'datetime'] as $filter) {
            $twig->addFilter(new TwigFilter($filter, static fn ($value) => $value instanceof \DateTimeInterface ? $value->format('c') : $value));
        }
        $twig->addFunction(new TwigFunction('cpUrl', static fn ($path) => '/admin/'.$path));
        $twig->addFunction(new TwigFunction('actionUrl', static fn ($path) => '/actions/'.$path));
        $twig->addFunction(new TwigFunction('csrfInput', static fn () => ''));
        $twig->addFunction(new TwigFunction('hiddenInput', static fn ($name, $value) => \sprintf('<input type="hidden" name="%s" value="%s">', $name, $value), ['is_safe' => ['html']]));
        $row = ActivityPresentation::present([
            'id' => 12, 'event' => 'error', 'formId' => 1, 'submissionId' => 10,
            'dateCreated' => '2026-11-16 12:00:00', 'metadata' => [],
            'resolvedAt' => $resolved ? '2026-11-16 12:01:00' : null, 'chainKey' => '1:10',
        ]);
        $html = $twig->render('results', [
            'craft' => ['app' => ['request' => ['url' => '/admin/freeform/activity']]],
            'filters' => ['days' => 0, 'submissionId' => 0, 'q' => '', 'category' => '', 'level' => ''],
            'activityView' => 'events', 'rows' => [$row], 'selected' => $row, 'timeline' => [$row],
            'before' => 0, 'after' => 0, 'pageNumber' => 1, 'total' => 1, 'pageInfo' => [], 'throughId' => 20,
            'forms' => [1 => 'Contact'], 'names' => ['system' => 'System'], 'levels' => ['error' => 'Error'],
            'canManage' => $canManage, 'canReadSubmission' => false, 'canManageForm' => false, 'canAccessIntegrations' => false,
        ]);
        $document = new \DOMDocument();
        @$document->loadHTML($html);
        $xpath = new \DOMXPath($document);
        $forms = '//div[contains(@class,"ff-activity-detail-header")]//form';
        self::assertSame($canManage ? 2 : 0, $xpath->query($forms)->length);
        self::assertSame(0, $xpath->query('//div[contains(@class,"ff-activity-detail-body")]//form')->length);
        if ($canManage) {
            foreach (['event', 'submission'] as $scope) {
                $form = $forms.'[input[@name="scope" and @value="'.$scope.'"]]';
                self::assertSame(1, $xpath->query($form.'[@method="post" and @action="/actions/freeform/activity/resolve"]')->length);
                foreach (['eventId' => 12, 'throughId' => 20, 'resolved' => $resolved ? 0 : 1] as $name => $value) {
                    self::assertSame(1, $xpath->query($form.'/input[@name="'.$name.'" and @value="'.$value.'"]')->length);
                }
            }
            self::assertStringContainsString($resolved ? 'Reopen event' : 'Mark resolved', $html);
        }
        self::assertSame($resolved ? 1 : 0, $xpath->query('//aside[contains(@class,"is-resolved")]')->length);
        self::assertSame($resolved ? 1 : 0, $xpath->query('//a[contains(@class,"ff-activity-event ") and contains(@class,"is-resolved")]')->length);
        self::assertSame($resolved ? 1 : 0, $xpath->query('//a[contains(@class,"ff-activity-timeline-step") and contains(@class,"is-resolved")]')->length);
    }

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
