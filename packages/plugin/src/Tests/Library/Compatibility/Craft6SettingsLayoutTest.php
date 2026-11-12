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

    private function render(bool $readOnly): string
    {
        $twig = new Environment(new ArrayLoader([
            'child' => '{% extends "settings" %}{% block content %}{{ parent() }}<input name="setting">{% endblock %}',
            'settings' => file_get_contents(__DIR__.'/../../../templates/_layouts/settings.twig'),
            'freeform/_layouts/main' => '{% if fullPageForm %}<button>Save</button>{% endif %}{% block contentNotice %}{% endblock %}{% block content %}{% endblock %}',
        ]));
        $twig->addFilter(new TwigFilter('t', static fn ($text) => $text));
        $twig->addFilter(new TwigFilter('hash', static fn ($text) => $text));
        $twig->addFilter(new TwigFilter('explodeClass', static fn ($value) => (array) $value));
        $twig->addFilter(new TwigFilter('push', static fn ($items, $value) => [...$items, $value]));
        $twig->addFilter(new TwigFilter('freeformRegexReplace', static fn ($value) => $value));
        $twig->addFunction(new TwigFunction('cpUrl', static fn ($url) => $url));
        $twig->addFunction(new TwigFunction('ui', static fn ($type, $config) => $config['content'] ?? ''));
        $request = new class {
            public string $absoluteUrl = '/admin/freeform/settings/general';

            public function getSegment(int $index): string
            {
                return [2 => 'settings', 3 => 'general'][$index] ?? '';
            }
        };

        return $twig->render('child', [
            'title' => 'General Settings',
            'readOnly' => $readOnly,
            'craft' => ['freeform' => ['name' => 'Freeform', 'settingsNavigation' => []], 'app' => ['request' => $request]],
        ]);
    }
}
