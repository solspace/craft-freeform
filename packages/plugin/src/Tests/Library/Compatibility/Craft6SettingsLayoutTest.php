<?php

namespace Solspace\Freeform\Tests\Library\Compatibility;

use PHPUnit\Framework\Attributes\CoversNothing;
use PHPUnit\Framework\TestCase;
use Twig\Environment;
use Twig\Loader\ArrayLoader;
use Twig\TwigFilter;
use Twig\TwigFunction;

#[CoversNothing]
class Craft6SettingsLayoutTest extends TestCase
{
    public function testReadOnlySettingsDoNotExposeANativeSaveAction(): void
    {
        $html = $this->render(true);
        self::assertStringNotContainsString('<button', $html);
        self::assertStringContainsString('Changes to these settings aren’t permitted', $html);
    }

    public function testEditableSettingsKeepTheNativeFormAndSaveAction(): void
    {
        $html = $this->render(false);
        self::assertStringContainsString('<button>Save</button>', $html);
        self::assertStringNotContainsString('aren’t permitted', $html);
    }

    public function testChildCurrentPageCrumbsAppearOnlyOnceAndKeepTheSettingsSelector(): void
    {
        foreach (['activity' => 'Logging', 'form-monitor' => 'Form Monitor', 'statuses' => 'Statuses', 'demo-templates' => 'Demo Templates'] as $section => $title) {
            $crumbs = $this->readCrumbs($this->render(false, [
                ['label' => 'Freeform', 'url' => 'freeform'],
                ['label' => 'Settings', 'url' => 'freeform/settings'],
                ['label' => $title, 'url' => 'freeform/settings/'.$section],
            ], $title, $section));

            self::assertSame(['Freeform', 'Settings', $title], array_column($crumbs, 'label'));
            self::assertTrue($crumbs[2]['current']);
            self::assertSame('Select settings page', $crumbs[2]['menu']['label']);
        }
    }

    public function testSelfLinkedCategoryCrumbsAreRemovedButParentHierarchyIsPreserved(): void
    {
        $crumbs = $this->readCrumbs($this->render(false, [
            ['label' => 'Freeform', 'url' => 'freeform'],
            ['label' => 'Settings', 'url' => 'freeform/settings'],
            ['label' => 'Reliability', 'url' => 'freeform/settings/notices-and-alerts?site=english#digests'],
        ], 'Alerts & Digests', 'notices-and-alerts'));
        self::assertSame(['Freeform', 'Settings', 'Alerts & Digests'], array_column($crumbs, 'label'));

        $crumbs = $this->readCrumbs($this->render(false, [
            ['label' => 'Freeform', 'url' => 'freeform'],
            ['label' => 'Settings', 'url' => 'freeform/settings'],
            ['label' => 'Statuses', 'url' => 'freeform/settings/statuses'],
        ], 'Review', 'statuses', '12'));
        self::assertSame(['Freeform', 'Settings', 'Statuses', 'Review'], array_column($crumbs, 'label'));
    }

    private function readCrumbs(string $html): array
    {
        preg_match('/<script id="crumbs" type="application\/json">(.*?)<\/script>/s', $html, $match);

        return json_decode($match[1], true, flags: \JSON_THROW_ON_ERROR);
    }

    private function render(bool $readOnly, ?array $crumbs = null, string $title = 'General Settings', string $section = 'general', string $record = ''): string
    {
        $twig = new Environment(new ArrayLoader([
            'child' => '{% extends "settings" %}{% block content %}{{ parent() }}<input name="setting">{% endblock %}',
            'settings' => file_get_contents(__DIR__.'/../../../templates/_layouts/settings.twig'),
            'freeform/_layouts/main' => '<script id="crumbs" type="application/json">{{ crumbs|json_encode|raw }}</script>{% if fullPageForm %}<button>Save</button>{% endif %}{% block contentNotice %}{% endblock %}{% block content %}{% endblock %}',
        ]));
        $twig->addFilter(new TwigFilter('t', static fn ($text) => $text));
        $twig->addFilter(new TwigFilter('hash', static fn ($text) => $text));
        $twig->addFilter(new TwigFilter('explodeClass', static fn ($value) => (array) $value));
        $twig->addFilter(new TwigFilter('push', static fn ($items, $value) => [...$items, $value]));
        $twig->addFilter(new TwigFilter('freeformRegexReplace', static fn ($value) => $value));
        $twig->addFunction(new TwigFunction('cpUrl', static fn ($url) => $url));
        $twig->addFunction(new TwigFunction('ui', static fn ($type, $config) => $config['content'] ?? ''));
        $request = new class($section, $record) {
            public string $absoluteUrl = '/admin/freeform/settings/general';

            public function __construct(private string $section, private string $record) {}

            public function getSegment(int $index): string
            {
                return [2 => 'settings', 3 => $this->section, 4 => $this->record][$index] ?? '';
            }
        };

        return $twig->render('child', [
            'title' => $title,
            'crumbs' => $crumbs,
            'readOnly' => $readOnly,
            'craft' => ['freeform' => ['name' => 'Freeform', 'settingsNavigation' => []], 'app' => ['request' => $request]],
        ]);
    }
}
